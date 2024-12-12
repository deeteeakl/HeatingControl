import appdaemon.plugins.hass.hassapi as hass
from enum import Enum
import voluptuous as vol
import hchelper as hchelp
from datetime import datetime, time, timedelta

"""
Sets the thermostats target temperature and switches heating on and off. Also adds the current temperature and heating mode to the thermostats.
For the documentation see https://github.com/bruxy70/Heating
"""

# Here you can change the modes set in the mode selector (in lower case)
MODE_ON = "on"
MODE_OFF = "off"
MODE_AUTO = "auto"
MODE_ECO = "eco"
MODE_VACATION = "vacation"

HYSTERESIS = 1.0  # Difference between the temperature to turn heating on and off (to avoid frequent switching)
MIN_TEMPERATURE = 10  # Always turn on if teperature is below
MAX_TEMPERATURE = 25  # Maximum value the heating should be set to in any room
LOG_LEVEL = "INFO"

# Other constants - do not change
HVAC_HEAT = "heat"
HVAC_OFF = "off"
ATTR_SWITCH_HEATING = "switch_heating"
ATTR_MAIN_THERMOSTAT = "main_thermostat"
ATTR_SOMEBODY_HOME = "somebody_home"
ATTR_HEATING_MODE = "heating_mode"
ATTR_TEMPERATURE_VACATION = "temperature_vacation"
ATTR_ROOMS = "rooms"
ATTR_DAYNIGHT = "day_night"
ATTR_TEMPERATURE_DAY = "temperature_day"
ATTR_TEMPERATURE_NIGHT = "temperature_night"
ATTR_THERMOSTATS = "thermostats"
ATTR_NAME = "name"
ATTR_CURRENT_TEMP = "current_temperature"
ATTR_HVAC_MODE = "hvac_mode"
ATTR_HVAC_MODES = "hvac_modes"
ATTR_TEMPERATURE = "temperature"
ATTR_UNKNOWN = "unknown"
ATTR_UNAVAILABLE = "unavailable"
ATTR_SCHEDULE = "schedule"


class HeatingControl(hass.Hass):
    def initialize(self):
        """Read all parameters. Set listeners. Initial run"""

        # Configuration validation schema
        ROOM_SCHEMA = vol.Schema(
            {
                vol.Required(ATTR_NAME): str,
                vol.Required(ATTR_DAYNIGHT): hchelp.existing_entity_id(self),
                vol.Required(ATTR_TEMPERATURE_DAY): hchelp.existing_entity_id(self),
                vol.Required(ATTR_TEMPERATURE_NIGHT): hchelp.existing_entity_id(self),
                vol.Required(ATTR_SCHEDULE): hchelp.existing_entity_id(self),
                vol.Required(ATTR_THERMOSTATS): vol.All(
                    hchelp.ensure_list, [hchelp.existing_entity_id(self)]
                ),
            },
        )
        APP_SCHEMA = vol.Schema(
            {
                vol.Required("module"): str,
                vol.Required("class"): str,
                vol.Required(ATTR_ROOMS): vol.All(hchelp.ensure_list, [ROOM_SCHEMA]),
                vol.Required(ATTR_MAIN_THERMOSTAT): hchelp.existing_entity_id(self),
                vol.Required(ATTR_SOMEBODY_HOME): hchelp.existing_entity_id(self),
                vol.Required(ATTR_TEMPERATURE_VACATION): hchelp.existing_entity_id(
                    self
                ),
                vol.Required(ATTR_HEATING_MODE): hchelp.existing_entity_id(self),
            },
            extra=vol.ALLOW_EXTRA,
        )
        __version__ = "0.0.2"  # pylint: disable=unused-variable
        self.__log_level = LOG_LEVEL
        try:
            config = APP_SCHEMA(self.args)
        except vol.Invalid as err:
            self.error(f"Invalid format: {err}", level="ERROR")
            return

        # Read and store configuration
        self.__main_thermostat = config.get(ATTR_MAIN_THERMOSTAT)
        self.__rooms = config.get(ATTR_ROOMS)
        self.__somebody_home = config.get(ATTR_SOMEBODY_HOME)
        self.__heating_mode = config.get(ATTR_HEATING_MODE)
        self.__temperature_vacation = config.get(ATTR_TEMPERATURE_VACATION)

        # Listen to events
        self.listen_state(self.somebody_home_changed, self.__somebody_home)
        self.listen_state(
            self.vacation_temperature_changed, self.__temperature_vacation
        )
        self.listen_state(self.mode_changed, self.__heating_mode)
        schedules = set()
        thermostats = []
        # Listen to events for temperature sensors and thermostats
        for room in self.__rooms:
            self.listen_state(self.daynight_changed, room[ATTR_DAYNIGHT])
            self.listen_state(self.target_changed, room[ATTR_TEMPERATURE_DAY])
            self.listen_state(self.target_changed, room[ATTR_TEMPERATURE_NIGHT])
            if room[ATTR_SCHEDULE] not in schedules:
                self.listen_state(self.schedule_changed, room[ATTR_SCHEDULE])
                schedules.add(room[ATTR_SCHEDULE])

            for thermostat in room[ATTR_THERMOSTATS]:
                if thermostat not in thermostats:
                    thermostats.append(thermostat)
                    self.listen_state(self.thermostat_changed, thermostat)

        # Initial update
        self.__update_heating()
        self.__update_thermostats()
        self.log("Ready for action...")

    def mode_changed(self, entity, attribute, old, new, kwargs):
        """Event handler: mode changed on/off/auto/eco/vacation"""
        heating = self.is_heating()
        self.__update_heating()
        if heating == self.is_heating():
            self.log("Heating changed, updating thermostats")
            self.__update_thermostats()

    def heating_changed(self, entity, attribute, old, new, kwargs):
        """Event handler: boiler state changed - update information on thermostats"""
        self.__update_thermostats()

    def vacation_temperature_changed(self, entity, attribute, old, new, kwargs):
        """Event handler: target vacation temperature"""
        if self.get_mode() == MODE_VACATION:
            self.__update_heating()
            self.__update_thermostats()

    def somebody_home_changed(self, entity, attribute, old, new, kwargs):
        """Event handler: house is empty / somebody came home"""
        if new.lower() == "on":
            self.log("Somebody came home.", level=self.__log_level)
        elif new.lower() == "off":
            self.log("Nobody home.", level=self.__log_level)
        self.__update_heating(force=True)
        self.__update_thermostats()

    def thermostat_changed(self, entity, attribute, old, new, kwargs):
        """Event handler: make sure thermostats do not get blank"""
        self.log(f"Thermostat changed {entity}, attribute {attribute}, old {old}, new {new}")
        self.__update_thermostats(thermostat_entity=entity)

    def daynight_changed(self, entity, attribute, old, new, kwargs):
        """Event handler: day/night changed"""
        self.__update_heating()
        self.log("updating daynight")
        for room in self.__rooms:
            if room[ATTR_DAYNIGHT] == entity:
                self.log(f"for thermostats for {room[ATTR_NAME]}")
                for thermostat in room[ATTR_THERMOSTATS]:
                    self.__update_thermostats(thermostat_entity=thermostat)

    def target_changed(self, entity, attribute, old, new, kwargs):
        """Event handler: target temperature"""
        target = hchelp.clamp(float(new), MIN_TEMPERATURE, MAX_TEMPERATURE)
        if target != float(new):
            self.set_value(entity, target)
        for room in self.__rooms:
            if (
                room[ATTR_TEMPERATURE_DAY] == entity
                or room[ATTR_TEMPERATURE_NIGHT] == entity
            ):
                for thermostat in room[ATTR_THERMOSTATS]:
                    self.__update_thermostats(thermostat_entity=thermostat)
        self.__update_heating()

    def schedule_changed(self, entity, attribute, old, new, kwargs):
        """Event handler: schedule for room"""
        self.log(f"Schedule {entity} changed from {old} to {new}, attribute {attribute}")
        for room in self.__rooms:
            if room[ATTR_SCHEDULE] == entity:
                self.log(f"checking room {room[ATTR_NAME]} schedule  {room[ATTR_SCHEDULE]} switch {room[ATTR_DAYNIGHT]} current state {self.get_state(room[ATTR_DAYNIGHT])}")
                if new == "on" and self.get_state(room[ATTR_DAYNIGHT]) == "off":
                    self.turn_on(room[ATTR_DAYNIGHT])
                elif self.get_state(room[ATTR_DAYNIGHT]) == "on":
                    self.turn_off(room[ATTR_DAYNIGHT])
                #self.set_state(room[ATTR_DAYNIGHT], new)
                test = "a"
        self.__update_heating()


    def __check_thermostats(self) -> (float, bool, bool):
        """Check state of all thermostats. Are all off? Are some on? What is the minimum temperature"""
        all_off = True
        some_on = False
        minimum = None
        vacation_temperature = float(self.get_state(self.__temperature_vacation))
        for room in self.__rooms:
            for thermostat in room[ATTR_THERMOSTATS]:
                sensor_data = self.get_state(thermostat, attribute="current_temperature")
                temperature = float(sensor_data)
                thermostat_state = self.get_state(thermostat, attribute="running_state")
                #self.log(f" check_themostat {thermostat} state {thermostat_state} temp {temperature}")

                if thermostat_state == HVAC_HEAT:
                    some_on = True
                    all_off = False

                if minimum == None or temperature < minimum:
                    minimum = temperature
        return minimum, some_on, all_off


    def __check_temperature(self) -> (float, bool, bool):
        """Check temperature of all thermostats. Are some bellow? Are all above? What is the minimum temperature"""
        some_below = False
        all_above = True
        minimum = None
        vacation_temperature = float(self.get_state(self.__temperature_vacation))
        for room in self.__rooms:
            for thermostat in room[ATTR_THERMOSTATS]:
                sensor_data = self.get_state(thermostat, attribute="current_temperature")
                if (
                    sensor_data is None
                    or sensor_data == ATTR_UNKNOWN
                    or sensor_data == ATTR_UNAVAILABLE
                ):
                    continue
                temperature = float(sensor_data)
                if self.get_mode() == MODE_VACATION:
                    target = vacation_temperature
                else:
                    target = self.__get_target_room_temp(room)
                if temperature < target:
                    all_above = False
                if temperature < (target - HYSTERESIS):
                    some_below = True
                if minimum == None or temperature < minimum:
                    minimum = temperature
        return minimum, some_below, all_above

    def is_heating(self) -> bool:
        """Is the boiler heating?"""
        return bool(self.get_state(self.__main_thermostat, attribute="hvac_action") == "heating")

    def is_somebody_home(self) -> bool:
        """Is somebody home?"""
        return bool(self.get_state(self.__somebody_home).lower() == "on")

    def get_mode(self) -> str:
        """Get heating mode off/on/auto/eco/vacation"""
        return self.get_state(self.__heating_mode).lower()

    def __set_heating(self, heat: bool):
        """Updating to drive Nest rather than set switch
        old function - Set the relay on/off"""

        is_heating = self.is_heating()

        self.log(f"set_Heating is_heating {is_heating}, heat {heat}")

        if heat:
            if not is_heating:
                self.log(f"Turning heating on. {self.__main_thermostat}", level=self.__log_level)
                try:
                    self.call_service("climate/set_temperature", entity_id=thermostat_entity, temperature=MAX_TEMPERATURE)
                    self.call_service("climate/set_hvac_mode", entity_id=thermostat_entity, hvac_mode = HVAC_HEAT)
                except Exception as e:
                    self.log(f"Error turning on heating {e}")

        else:
            if is_heating:
                self.log(f"Turning heating off. {self.__main_thermostat}", level=self.__log_level)
                try:
                    self.call_service("climate/set_temperature", entity_id=self.__main_thermostat, temperature=MIN_TEMPERATURE)
                    self.call_service("climate/set_hvac_mode", entity_id=self.__main_thermostat, hvac_mode = HVAC_OFF)
                except Exception as e:
                    self.log(f"Error turning off heating {e}")

    def __set_thermostat(
        self, entity_id: str, target_temp: float, mode: str
    ):
        """Set the thermostat attrubutes and state"""
        if target_temp is None:
            target_temp = self.get_state(entity_id, attribute="current_temperature")
        if mode is None:
            if self.is_heating():
                mode = HVAC_HEAT
            else:
                mode = HVAC_OFF
        self.log(
            f"Updating thermostat {entity_id}: "
            f"temperature {target_temp}, "
            f"mode {mode}."
        )
        if target_temp is not None and mode is not None:
            self.set_state(entity_id, state=mode)
            self.call_service(
                "climate/set_temperature", entity_id=entity_id, temperature=target_temp
            )
        self.__update_heating()

    def __get_target_room_temp(self, room) -> float:
        """Returns target room temparture, based on day/night switch (not considering vacation)"""
        if bool(self.get_state(room[ATTR_DAYNIGHT]).lower() == "on"):
            return float(self.get_state(room[ATTR_TEMPERATURE_DAY]))
        else:
            return float(self.get_state(room[ATTR_TEMPERATURE_NIGHT]))

    def __update_heating(self, force: bool = False):
        """Turn boiler on/off"""
        minimum, some_on, all_off = self.__check_thermostats()
        mode = self.get_mode()

        self.log(f"Update Heating some_on {some_on}, all_off {all_off}, minimum {minimum}, mode {mode}, heating {self.is_heating()}")

        # Heating is on so set heating on
        if mode == MODE_ON:
            self.__set_heating(True)
            return
        # Heating mode is off so set heating off 
        if mode == MODE_OFF:
            self.__set_heating(False)
            return
        # Heating in Auto mode and there is someone home
        # then turn on if at least one thermostat is set to 
        # heat, off otherwise   
        if mode == MODE_AUTO:
        #and self.is_somebody_home():
            if self.is_heating():
                if all_off:
                    self.__set_heating(False)
            else:
                if some_on:
                    self.__set_heating(True)
            return
        # Not sure what this one does
        if force:
            if self.is_somebody_home():
                if not all_off:
                    self.__set_heating(True)
            else:
                if not some_on:
                    self.__set_heating(False)
        else:
            if self.is_heating():
                if all_off:
                    self.__set_heating(False)
            else:
                if some_on:
                    self.__set_heating(True)

    def __update_thermostats(
        self, thermostat_entity: str = None):
        """Set the thermostats target temperature, and heating mode"""
        vacation = self.get_mode() == MODE_VACATION
        vacation_temperature = float(self.get_state(self.__temperature_vacation))

        for room in self.__rooms:
            if (
                (thermostat_entity is None )
                or (thermostat_entity in room[ATTR_THERMOSTATS])
#                or (sensor_entity == room[ATTR_SENSOR])
            ):
                #self.log(f"updating sensor {room[ATTR_NAME]}")
                target_temperature = self.__get_target_room_temp(room)
                if self.is_heating():
                    mode = HVAC_HEAT
                else:
                    mode = HVAC_OFF
                for thermostat in room[ATTR_THERMOSTATS]:
                    if vacation:
                        self.__set_thermostat(
                            thermostat, vacation_temperature, mode
                        )
                    else:
                        self.__set_thermostat(
                            thermostat, target_temperature, mode
                        )
        self.__update_heating()