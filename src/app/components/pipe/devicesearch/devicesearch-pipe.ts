import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'devicesearch'
})
export class DevicesearchPipe implements PipeTransform {


  transform(devices: any[], searchText: string){
    if (!devices || !searchText) return devices;

    searchText = searchText.toLowerCase();

    // return devices.filter(device =>
    //   (device.deviceName?.toLowerCase().includes(searchText)) ||
    //   (device.uniqueId?.toLowerCase().includes(searchText)) ||
    //   (device.deviceType?.toLowerCase().includes(searchText)) ||
    //   (device.projectName?.toLowerCase().includes(searchText)) ||
    //   (device.countryName?.toLowerCase().includes(searchText)) ||
    //   (device.zoneName?.toLowerCase().includes(searchText))
    // );

return devices.filter(function (device) {
  return (
    device.deviceName?.toLowerCase().includes(searchText) ||
    device.uniqueId?.toLowerCase().includes(searchText) ||
    device.deviceType?.toLowerCase().includes(searchText) ||
    device.projectName?.toLowerCase().includes(searchText) ||
    device.countryName?.toLowerCase().includes(searchText) ||
    device.zoneName?.toLowerCase().includes(searchText)
  );
});

}
}
