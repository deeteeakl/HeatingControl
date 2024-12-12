var myDeviceID;
$(function(){ //DOM Ready

    function navigate(url)
    {
        window.location.href = url;
    }

    $(document).attr("title", "Main Panel");
    content_width = (122 + 5) * 8 + 5
    $('.gridster').width(content_width)
    $(".gridster ul").gridster({
        widget_margins: [5, 5],
        widget_base_dimensions: [122, 120],
        avoid_overlapped_widgets: true,
        max_rows: 15,
        max_size_x: 8,
        shift_widgets_up: false
    }).data('gridster').disable();

    // Add Widgets

    var gridster = $(".gridster ul").gridster().data('gridster');
    
        gridster.add_widget('<li><div data-bind="attr: {style: widget_style}" class="widget widget-baseclock-default-clock-clock" id="default-clock-clock"><h1 class="date"data-bind="text: date, attr: {style: date_style}"></h1><h2 class="time" data-bind="text: time, attr: {style: time_style}"></h2></div></li>', 2, 1, 1, 1)
    
        gridster.add_widget('<li><div data-bind="attr: {style: widget_style}" class="widget widget-baseweather-default-weather" id="default-weather"><h1 class="title" data-bind="text: title, attr:{ style: title_style}"></h1><div data-bind="attr: {style: main_style}"><p class="primary-climacon" data-bind="css: icon"></p><p class="primary-info" data-bind="text: temperature"></p><p class="primary-unit" data-bind="html: unit, attr: {style: unit_style}"></p><br></div><div data-bind="attr: {style: sub_style}"><p class="secondary-detail" data-bind="visible: apparent_temperature"><span class="secondary-icon mdi mdi-thermometer-lines" title="Apparent Temp" data-bind="visible: prefer_icons"></span><span class="secondary-info" data-bind="visible: !prefer_icons()">Apparent Temp:&nbsp;</span><span class="secondary-info" data-bind="html: apparent_temperature"></span><span class="secondary-info" data-bind="html: unit, attr: {style: sub_unit_style}"></span></p><p class="secondary-detail" data-bind="visible: humidity"><span class="secondary-icon mdi mdi-water-percent" title="Humidity" data-bind="visible: prefer_icons"></span><span class="secondary-info" data-bind="visible: !prefer_icons()">Humidity:&nbsp;</span><span class="secondary-info" data-bind="text: humidity"></span><span class="secondary-unit" data-bind="attr: {style: sub_unit_style}">%</span><br></p><p class="secondary-detail"  data-bind="visible: precip_probability() || precip_intensity()"><span data-bind="visible: precip_probability"><span class="secondary-icon mdi" title="Rain" data-bind="visible: prefer_icons, css: precip_type_icon"></span><span class="secondary-info" data-bind="visible: !prefer_icons()">Rain:&nbsp;</span><span class="secondary-info" data-bind="text: precip_probability"></span><span class="secondary-unit" data-bind="attr: {style: sub_unit_style}">%</span></span><span data-bind="visible: precip_intensity"><span class="secondary-info" data-bind="visible: precip_intensity() && precip_probability()">&nbsp;/&nbsp;</span><span class="secondary-info" data-bind="text: precip_intensity"></span><span class="secondary-unit" data-bind="text: rain_unit, attr: {style: sub_unit_style}"></span></span></p><p class="secondary-detail" data-bind="visible: wind_speed"><span class="secondary-icon mdi mdi-weather-windy" data-bind="visible: prefer_icons, css: bearing_icon, attr: {title: wind_bearing() + \'&deg;\'}"></span><span class="secondary-info" data-bind="visible: !prefer_icons()">Wind:&nbsp;</span><span class="secondary-info" data-bind="text: wind_speed"></span><span class="secondary-unit" data-bind="text: wind_unit, attr: {style: sub_unit_style}"></span></p><p class="secondary-detail" data-bind="visible: wind_bearing() && !prefer_icons()"><span class="secondary-info" data-bind="html: wind_bearing"></span><span class="secondary-unit" data-bind="attr: {style: sub_unit_style}">&deg;</span></p><p class="secondary-detail" data-bind="visible: pressure() != \'\'"><span class="secondary-icon mdi mdi-gauge" data-bind="visible: prefer_icons"></span><span class="secondary-info" data-bind="visible: !prefer_icons()">Pressure:&nbsp;</span><span class="secondary-info" data-bind="text: pressure"></span><span class="secondary-info" data-bind="text: pressure_unit, attr: {style: sub_unit_style}"></span></p><div data-bind="visible: show_forecast"><hr><h1 class="title" data-bind="text: forecast_title, attr:{ style: title_style}, visible: show_forecast"></h1><p class="secondary-detail" data-bind="visible: forecast_temperature_min"><span class="secondary-climacon" data-bind="css: forecast_icon"></span></p><p class="secondary-detail" data-bind="visible: forecast_temperature_min"><span class="secondary-info" data-bind="text: forecast_temperature_min"></span><span class="secondary-info" data-bind="visible: forecast_temperature_max"><span>/</span><span class="secondary-info" data-bind="text: forecast_temperature_max"></span></span></p><p class="secondary-detail" data-bind="visible: forecast_precip_probability"><span class="secondary-icon mdi" title="Rain" data-bind="visible: prefer_icons, css: forecast_precip_type_icon"></span><span class="secondary-info" data-bind="visible: !prefer_icons()">Rain:&nbsp;</span><span class="secondary-info" data-bind="text: forecast_precip_probability"></span><span class="secondary-icon" data-bind="attr: {style: sub_unit_style}">%</span></p></div></div></div></li>', 2, 2, 3, 1)
    
        gridster.add_widget('<li><div data-bind="attr: {style: widget_style}" class="widget widget-baseswitch-default-david-presence" id="default-david-presence"><span class="toggle-area" id="switch"></span><h1 class="title" data-bind="text: title, attr:{style: title_style}"></h1><h1 class="title2" data-bind="text: title2, attr:{style: title2_style}"></h1><h2 class="icon" data-bind="attr:{style: icon_style}"><i data-bind="attr: {class: icon}"></i></h2><h1 class="state_text" data-bind="text: state_text, attr: {style: state_text_style}"></h1></div></li>', 1, 1, 5, 1)
    
        gridster.add_widget('<li><div data-bind="attr: {style: widget_style}" class="widget widget-basealarm-default-alarm" id="default-alarm"><span class="toggle-area" id="switch"></span><h1 class="title" data-bind="text: title, attr:{ style: title_style}"></h1><h1 class="title2" data-bind="text: title2, attr:{ style: title2_style}"></h1><h2 class="value" data-bind="text: state, attr:{ style: state_style}"></h2><div id="Dialog" class="modalDialog"><div data-bind="attr:{style: panel_background_style}"><h2 id="close" class="modalDialogCloseButton">&times;</h2><h2 class="panel-state" data-bind="text: state, attr:{style: panel_state_style}"></h2><h2 class="panel-state" data-bind="text: code, attr:{style: panel_code_style}"></h2><div class="container">    <span data-bind="attr:{style: panel_button_style}" class="block" id="1">1</span class="block">    <span data-bind="attr:{style: panel_button_style}" class="block" id="2">2</span class="block">    <span data-bind="attr:{style: panel_button_style}" class="block" id="3">3</span class="block">    <span data-bind="attr:{style: panel_button_style}" class="block" id="4">4</span class="block">    <span data-bind="attr:{style: panel_button_style}" class="block" id="5">5</span class="block">    <span data-bind="attr:{style: panel_button_style}" class="block" id="6">6</span class="block">    <span data-bind="attr:{style: panel_button_style}" class="block" id="7">7</span class="block">    <span data-bind="attr:{style: panel_button_style}" class="block" id="8">8</span class="block">    <span data-bind="attr:{style: panel_button_style}" class="block" id="9">9</span class="block">    <span data-bind="attr:{style: panel_button_style}" class="block block2" id="0">0</span class="block">    <span data-bind="attr:{style: panel_button_style}" class="block mdi mdi-keyboard-backspace" id="BS"></span class="block">    <span data-bind="attr:{style: panel_button_style}" class="block mdi mdi-home" id="AH" ></span class="block">    <span data-bind="attr:{style: panel_button_style}" class="block mdi mdi-home-outline" id="AA"></span class="block">    <span data-bind="attr:{style: panel_button_style}" class="block fa fa-power-off" id="DA"></span class="block">    <span data-bind="attr:{style: panel_button_style}" class="block block3" id="TR">Trigger</span class="block"></div></div></div></div></li>', 2, 1, 1, 2)
    
        gridster.add_widget('<li><div data-bind="attr: {style: widget_style}" class="widget widget-baseswitch-default-entrance-motion" id="default-entrance-motion"><span class="toggle-area" id="switch"></span><h1 class="title" data-bind="text: title, attr:{style: title_style}"></h1><h1 class="title2" data-bind="text: title2, attr:{style: title2_style}"></h1><h2 class="icon" data-bind="attr:{style: icon_style}"><i data-bind="attr: {class: icon}"></i></h2><h1 class="state_text" data-bind="text: state_text, attr: {style: state_text_style}"></h1></div></li>', 1, 1, 5, 2)
    
        gridster.add_widget('<li><div data-bind="attr: {style: widget_style}" class="widget widget-basegauge-default-upstairs-humidity" id="default-upstairs-humidity"><h1 class="title" data-bind="text: title, attr:{ style: title_style}"></h1><h1 class="title2" data-bind="text: title2, attr:{ style: title2_style}"></h1><div class="graph"></div></div></li>', 1, 1, 6, 2)
    


    var widgets = {}
    // Initialize Widgets
    
        widgets["default-clock-clock"] = new baseclock("default-clock-clock", "", "default", {'widget_type': 'baseclock', 'fields': {'date': '', 'time': ''}, 'static_css': {'date_style': 'color: #fff;', 'time_style': 'color: #aa00ff;', 'widget_style': 'background-color: #444;'}, 'static_icons': [], 'icons': [], 'css': {}, 'entity': 'clock.clock', 'title_is_friendly_name': 1, 'namespace': 'default'})
    
        widgets["default-weather"] = new baseweather("default-weather", "", "default", {'widget_type': 'baseweather', 'fields': {'title': '', 'show_forecast': 0, 'prefer_icons': 0, 'unit': '', 'wind_unit': '', 'pressure_unit': '', 'rain_unit': '', 'temperature': '', 'humidity': '', 'precip_probability': '', 'precip_intensity': '', 'precip_type': '', 'wind_speed': '', 'pressure': '', 'wind_bearing': '', 'apparent_temperature': '', 'icon': '', 'bearing_icon': 'mdi-rotate-0', 'precip_type_icon': 'mdi-umbrella', 'forecast_title': '', 'forecast_temperature_min': '', 'forecast_temperature_max': '', 'forecast_icon': '', 'forecast_precip_probability': '', 'forecast_precip_type': '', 'forecast_precip_type_icon': 'mdi-umbrella'}, 'entities': {'icon': 'sensor.dark_sky_icon', 'temperature': 'sensor.dark_sky_temperature', 'apparent_temperature': 'sensor.dark_sky_apparent_temperature', 'humidity': 'sensor.dark_sky_humidity', 'precip_probability': 'sensor.dark_sky_precip_probability', 'precip_intensity': 'sensor.dark_sky_precip_intensity', 'precip_type': 'sensor.dark_sky_precip', 'pressure': 'sensor.dark_sky_pressure', 'wind_speed': 'sensor.dark_sky_wind_speed', 'wind_bearing': 'sensor.dark_sky_wind_bearing', 'forecast_icon': 'sensor.dark_sky_icon_1d', 'forecast_temperature_min': 'sensor.dark_sky_daily_low_temperature_1d', 'forecast_temperature_max': 'sensor.dark_sky_daily_high_temperature_1d', 'forecast_precip_probability': 'sensor.dark_sky_precip_probability_1d', 'forecast_precip_type': 'sensor.dark_sky_precip_1d'}, 'css': {}, 'static_css': {'title_style': 'color: #00aaff;', 'unit_style': 'color: #ffaa00;', 'main_style': 'color: #ffaa00;', 'sub_style': 'color: #00aaff;', 'sub_unit_style': 'color: #00aaff;', 'widget_style': 'background-color: #444;'}, 'icons': {'snow': 'mdi-snowflake', 'rain': 'mdi-umbrella', 'sleet': 'mdi-weather-snowy-rainy', 'unknown': 'mdi-umbrella'}, 'static_icons': [], 'units': '&deg;C', 'namespace': 'default'})
    
        widgets["default-david-presence"] = new baseswitch("default-david-presence", "", "default", {'widget_type': 'baseswitch', 'entity': 'device_tracker.david_s_iphone', 'state_active': 'home', 'state_inactive': 'not_home', 'enable': 1, 'state_text': 1, 'post_service_active': {'service': 'device_tracker/see', 'dev_id': 'david_s_iphone', 'location_name': 'home'}, 'post_service_inactive': {'service': 'device_tracker/see', 'dev_id': 'david_s_iphone', 'location_name': 'not_home'}, 'fields': {'title': 'David', 'title2': '', 'icon': '', 'icon_style': '', 'state_text': ''}, 'icons': {'icon_on': 'fas-user', 'icon_off': 'fas-user'}, 'static_icons': [], 'css': {'icon_style_active': 'color: #aaff00;', 'icon_style_inactive': 'color: #888;'}, 'static_css': {'title_style': 'color: #fff;', 'title2_style': 'color: #fff;', 'state_text_style': 'color: #fff;', 'widget_style': 'background-color: #444;'}, 'state_map': {'home': 'HOME', 'not_home': 'AWAY'}, 'namespace': 'default'})
    
        widgets["default-alarm"] = new basealarm("default-alarm", "", "default", {'widget_type': 'basealarm', 'entity': 'alarm_control_panel.home', 'initial_string': 'Enter Code', 'post_service_ah': {'service': 'alarm_control_panel/alarm_arm_home', 'entity_id': 'alarm_control_panel.home'}, 'post_service_aa': {'service': 'alarm_control_panel/alarm_arm_away', 'entity_id': 'alarm_control_panel.home'}, 'post_service_da': {'service': 'alarm_control_panel/alarm_disarm', 'entity_id': 'alarm_control_panel.home'}, 'post_service_tr': {'service': 'alarm_control_panel/alarm_trigger', 'entity_id': 'alarm_control_panel.home'}, 'state_map': {'pending': 'Pending', 'armed_home': 'Armed Home', 'armed_away': 'Armed Away', 'disarmed': 'Disarmed', 'triggered': 'Triggered'}, 'fields': {'title': 'Alarm', 'title2': '', 'state': '', 'code': ''}, 'static_css': {'title_style': 'color: white;', 'title2_style': 'color: #fff;', 'state_style': 'color: #fff;font-size: 250%;', 'widget_style': 'background-color: #444;', 'panel_state_style': 'color: #fff;', 'panel_code_style': 'color: #fff;', 'panel_background_style': 'background-color: #444;', 'panel_button_style': 'background-color: #666;'}, 'css': {}, 'icons': [], 'static_icons': [], 'state_style': 'font-size: 250%;', 'title_style': 'color: white;', 'namespace': 'default'})
    
        widgets["default-entrance-motion"] = new baseswitch("default-entrance-motion", "", "default", {'widget_type': 'baseswitch', 'entity': 'binary_sensor.entrance_hall_movement_sensor_occupancy', 'state_active': 'on', 'state_inactive': 'off', 'fields': {'title': 'Entrance', 'title2': '', 'icon': '', 'icon_style': '', 'state_text': ''}, 'icons': {'icon_on': 'fas-bullseye', 'icon_off': 'fas-minus'}, 'static_icons': [], 'css': {'icon_style_active': 'color: #ff0055;', 'icon_style_inactive': 'color: #888;'}, 'static_css': {'title_style': 'color: #fff;', 'title2_style': 'color: #fff;', 'state_text_style': 'color: #fff;', 'widget_style': 'background-color: #444;'}, 'namespace': 'default'})
    
        widgets["default-upstairs-humidity"] = new basegauge("default-upstairs-humidity", "", "default", {'widget_type': 'basegauge', 'entity': 'sensor.upstairs_humidity', 'low_color': '#00aaff', 'med_color': '#00aaff', 'high_color': '#00aaff', 'bgcolor': '#666', 'color': '#00aaff', 'fields': {'title': 'Humidity', 'title2': '', 'unit': ''}, 'static_css': {'title_style': 'color: #fff;', 'title2_style': 'color: #fff;', 'unit_style': '', 'value_style': '', 'widget_style': 'background-color: #444;'}, 'css': {}, 'icons': [], 'static_icons': [], 'max': 100, 'min': 0, 'units': '%', 'namespace': 'default'})
    

    // Setup click handler to cancel timeout navigations

    $( ".gridster" ).click(function(){
        clearTimeout(myTimeout);
        if (myTimeoutSticky) {
            myTimeout = setTimeout(function() { navigate(myTimeoutUrl); }, myTimeoutDelay);
        }
    });

    // Set up timeout

    var myTimeout;
    var myTimeoutUrl;
    var myTimeoutDelay;
    var myTimeoutSticky = 0;
    if (location.search != "")
    {
        console.log("begin")
        var query = location.search.substr(1);
        var result = {};
        query.split("&").forEach(function(part) {
        var item = part.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
        });

        if ("deviceid" in result)
        {
            myDeviceID = result.deviceid;
            try
            {
                setCookie('ADdevID', myDeviceID);
            }
            catch (e)
            {
                console.log(e);
            }
        }
        else
        {
            try
            {
                myDeviceID = getCookie('ADdevID');
            }
            catch (e)
            {
                console.log(e);
                myDeviceID = null;
            }
        }
        if ("timeout" in result && "return" in result)
        {
            url = result.return
            argcount = 0
            for (arg in result)
            {
                if (arg != "timeout" && arg != "return" && arg != "sticky")
                {
                    if (argcount == 0)
                    {
                        url += "?";
                    }
                    else
                    {
                        url += "&";
                    }
                    argcount ++;
                    url += arg + "=" + result[arg]
                }
            }
            if ("sticky" in result)
            {
                myTimeoutSticky = (result.sticky == "1");
            }
            myTimeoutUrl = url;
            myTimeoutDelay = result.timeout * 1000;
            myTimeout = setTimeout(function() { navigate(url); }, result.timeout * 1000);
        }
    }
    else
    {
        try
        {
            myDeviceID = getCookie('ADdevID');
        }
        catch (e)
        {
            console.log(e);
            myDeviceID = null;
        }
    }

    // Start listening for AD Events

    window.dashstream = new DashStream("ws", location.protocol, document.domain, location.port, "Main Panel", widgets);

});