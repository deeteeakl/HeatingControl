import appdaemon.plugins.hass.hassapi as hass

#
# Hellow World App
#
# Args:
#

switch_entity = "input_boolean.on_holiday"
thermostat_entity = "climate.upstairs"

def clamp(value: float, min_value: float, max_value: float) -> float:
    """return value clamped between min and max value"""
    if value < min_value:
        return min_value
    elif value > max_value:
        return max_value
    else:
        return value


class HelloWorld(hass.Hass):

  def initialize(self):
     self.log("Hello from AppDaemon")
     self.listen_state(self.test, switch_entity)


  def test(self, entity, attribute, old, new, kwargs):
      self.log(f"triggered {old} {new} {attribute}")
      if new == 'on':
        self.log(f"Turning heating on. {thermostat_entity}")
        try:
          self.call_service("climate/set_temperature", entity_id=thermostat_entity, temperature=20)
          self.call_service("climate/set_hvac_mode", entity_id=thermostat_entity, hvac_mode = "heat")
        except Exception as e:
          self.log(f"Error turning on heating {e}")

      else:
        self.log(f"Turning heating off. {thermostat_entity}")
        try:
        #self.call_service("climate/set_temperature", entity_id=thermostat_entity, temperature=20)
          self.call_service("climate/set_hvac_mode", entity_id=thermostat_entity, hvac_mode = "off")
        except Exception as e:
          self.log(f"Error turning off heating {e}")
