import appdaemon.plugins.hass.hassapi as hass
from typing import Any, Sequence, TypeVar, Union
from datetime import datetime, time
import voluptuous as vol


def time(value: Any) -> time:
    try:
        return datetime.strptime(value, "%H:%M").time()
    except ValueError:
        raise vol.Invalid(f"Invalid time: {value}")


def entity_id(value: Any) -> str:
    value = str(value).lower()
    if "." in value:
        return value
    raise vol.Invalid(f"Invalid entity-id: {value}")


def ensure_list(value):
    if isinstance(value, list):
        return value
    elif value:
        return [value]
    return []

def clamp(value: float, min_value: float, max_value: float) -> float:
    """return value clamped between min and max value"""
    if value < min_value:
        return min_value
    elif value > max_value:
        return max_value
    else:
        return value

class existing_entity_id(object):
    def __init__(self, hass):
        self._hass = hass

    def __call__(self, value: Any) -> str:
        value = str(value).lower()
        if "." not in value:
            raise vol.Invalid(f"Invalid entity-id: {value}")
        if not self._hass.entity_exists(value):
            raise vol.Invalid(f"Entity-id {value} does not exist")
        return value