export const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
  
export const format = (x) => {
    return isNaN(x)?"":x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
  
export const compareValues = (key, order = 'asc') => {
    return function innerSort(a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        // property doesn't exist on either object
        return 0;
        }

        const varA = (typeof a[key] === 'string')
        ? a[key].toUpperCase() : a[key];
        const varB = (typeof b[key] === 'string')
        ? b[key].toUpperCase() : b[key];

        let comparison = 0;
        if (varA > varB) {
        comparison = 1;
        } else if (varA < varB) {
        comparison = -1;
        }
        return (
        (order === 'desc') ? (comparison * -1) : comparison
        );
    };
}
  
export const log = (data) => {
    console.log(data);
}

export const searchObj = (obj, key, value) => {
    var result = obj.filter((e) => {
        return e[key] === value;
    });
    return result;
}