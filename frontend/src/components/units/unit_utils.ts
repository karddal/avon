
export function initials(name: string): string {
    // Source - https://stackoverflow.com/a
    // https://stackoverflow.com/questions/33076177/getting-name-initials-using-js
    // Posted by Vandesh, modified by community. See post 'Timeline' for change history
    // Retrieved 2026-01-04, License - CC BY-SA 4.0
    const allNames = name.trim().split(' ');
    const initials = allNames.reduce((acc, curr, index) => {
        if(index === 0 || index === allNames.length - 1){
            acc = `${acc}${curr.charAt(0).toUpperCase()}`;
        }
        return acc;
    }, '');
    return initials;
}