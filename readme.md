# Heating

This is an AppDaemon automation of my heating in Home Assistant.  This is a version of the solution developed by https://github.com/bruxy70

The key differences are 
- that this implementation controls the heating via a main thermostat and not the switch
- the temperature sensor is part of the thermostat (Sonoff TRV) so no need to implement any logic to switch on/off
- The main thermostat is turned on when at least one thermostat wants heat 
- The main thermostat is turned off if no thermostat needs heat
- The heat schedule is controlled by schedule helpers.  Each room can have its own schedule or can share.

# Installation

1. This requires AppDeamon installed and configured (follow the documentation on their web site).
2. Make sure that `voluptuous` and `datetime` are incuded in the `python_packages` option
3. Copy the content of the appdaemon directory from this repository to your home assistant `/config/appdaemon` folder
4. Add configuration to your Home Assistant's `/config/appdaemon/apps/apps.yaml`


# Configuration

This is the configuration that goes into `/config/appdaemon/apps/apps.yaml`

## Example:
```yaml
heating-control:
  module: heating-control
  class: HeatingControl
  main_thermostat: climate.upstairs
  somebody_home: input_boolean.somebody_home
  heating_mode: input_select.heating_mode
  temperature_vacation: input_number.temperature_vacation
  rooms:
  - name: Main Bedroom
    day_night: input_boolean.main_bedroom_day_night
    temperature_day: input_number.main_bedroom_day
    temperature_night: input_number.main_bedroom_night
    schedule: schedule.upstairs
    thermostats:
    - climate.termostat_living_room
```

## Parameters:
|Attribute |Required|Description
|:----------|----------|------------
| `module` | Yes | Always `heating-control`
| `class` | Yes | Always `HeatingControl`
| `main_thermostat` | Yes | entity_id of the thermostat controling the boiler
| `somebody_home` | Yes | entity_id of the boolean value that is on when somebody is home and off otherwise
| `heating_mode` | Yes | entity_id of the input select with heating modes. Can contain the values `On`, `Off`, `Eco`, `Auto` and `Vacation` - these values can be changed - se the bottom of this README. Not all values have to be defined.
| `temperature_vacation` | Yes | entity_id of the input containg the temperature to be used for vacation mode
| `rooms` | Yes | List of rooms - see bellow

## Room parameters
|Attribute |Required|Description
|:----------|----------|------------
| `sensor` | Yes | entity_id of the temperature sensor
| `day_night` | Yes | entity_id of the boolean switch between high/low (day/night). This is on for 'day', off for 'night'
| `temperature_day` | Yes | entity_id of the input containg the high (or day) temperature for the given room
| `temperature_night` | Yes | entity_id of the input containg the low (or night) temperature for the given room
| `schedule` | Yes | entity_id of the schedule helper that controls when heating should be on off
| `thermostats` | Yes | list of thermostat entity_ids


## Other configuration
The `heating-control.py` file uses constants for the 5 heating modes. If you'd like to name your modes differently, you can change them there. The values should be in lowercase.
```python
MODE_ON = "on"
MODE_OFF = "off"
MODE_AUTO = "auto"
MODE_ECO = "eco"
MODE_VACATION = "vacation"
```