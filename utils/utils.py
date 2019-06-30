#!/usr/bin/env python

def get_cpu_temperature():
    with open('/sys/class/thermal/thermal_zone0/temp', 'r') as f:
        lines = f.readlines()
    temp = lines[0]
    temp = int(temp)
    temp /= 1000
    temp = str(temp) + '\x06' + 'C'
    return temp