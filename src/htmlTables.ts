export class HtmlTables {

    private static ampRegex = /&/g;
    private static ltRegex = /</g;

    public static constructTableForObject(obj: any) {
        if (typeof obj === 'object') {
            if (Array.isArray(obj)) {
                return this.constructTableForArray(obj);
            } else {

            }
        }
    }

    private static constructTableForArray(array: Array<any>) {
        const tags: string[] = [];
        tags.push('<table><tbody>');
        array.forEach((item) => {
            tags.push('<tr>');
            if (Array.isArray(item)) {
                item.forEach((innerItem) => {
                    tags.push(`<td>${this.escape(innerItem)}</td>`);
                })
            } else {
                tags.push(`<td>${this.escape(item)}</td>`);
            }
            tags.push('</tr>');
        });
        tags.push('</tbody></table>');
        return(tags.join(''));
    }

    private static escape(obj: any) {
        if (typeof obj === 'string') {
            return obj.replace(this.ampRegex, '&amp;').replace(this.ltRegex, '&lt;');
        } else {
            return JSON.stringify(obj).replace(this.ampRegex, '&amp;').replace(this.ltRegex, '&lt;');
        }
    }
}