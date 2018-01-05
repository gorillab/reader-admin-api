const arrayDiff = (arr1, arr2) => arr1.filter(item => arr2.indexOf(item) < 0);

module.exports = arrayDiff;
