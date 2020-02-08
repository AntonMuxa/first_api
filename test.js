var dat = '30.02.2020';


let date = new Date(dat);
if(date == 'Invalid date') {
let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();


console.log(day);
console.log(month);
console.log(year);
} else {
    console.log('invalid');
}