import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'documentformat'
})
export class DocumentFormatPipe implements PipeTransform {
  transform(value: string): string {
    const data = value.replace(/[^0-9]/g, '');
    if (data.length === 11) {
      return data.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "\$1.\$2.\$3\-\$4");
    } else if (data.length === 14) {
      return data.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "\$1.\$2.\$3\/\$4\-\$5");
    }
    return value;
  }
}
