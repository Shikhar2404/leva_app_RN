const uniqueArray = (array1, array2, uniquekey = "id", extraObjectToApply = null) => {
    const a = array1.concat(array2);
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i][uniquekey] === a[j][uniquekey]) {
                if (extraObjectToApply) {
                    for (const newKey in extraObjectToApply) {
                        if (extraObjectToApply.hasOwnProperty(newKey)) {
                            a[i][newKey] = extraObjectToApply[newKey];
                            a[j][newKey] = extraObjectToApply[newKey];
                        }
                    }
                }
                a.splice(j--, 1);
            }
        }
    }

    return a;
}
const uniqueArrayDate = (array1, array2, uniquekey = "id",  sortkey) => {
    const newarray = array1.concat(array2);
    var result = []
    newarray.map((item) => {
        var index = result.findIndex(element => element[uniquekey] === item[uniquekey]);
        if (index != -1) {
            let newdata = result[index].data.concat(item.data);
            result[index].data = sortkey ? newdata.sort((a, b) => (a[sortkey] > b[sortkey]) ? -1 : ((b[sortkey] > a[sortkey]) ? 1 : 0)) : newdata
        } else {
            result.push(item)
        }

    })

    return result.sort((objA, objB) => Number(objB.id) - Number(objA.id));

}

const sortByKey = (a, b, key) => {
    var textA = a[key].toUpperCase();
    var textB = b[key].toUpperCase();

    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
}


const getFlatArray = (array) => {
    const items = [];

    for (const item of array) {
        if (item.data && item.data.length > 0) {
            for (const data of item.data) {
                items.push(data);
            }
        }
    }

    return items;
}
const formatTimeString = (time, showMsecs, type) => {
    let msecs = time % 1000;

    if (msecs < 10) {
        msecs = `00${msecs}`;
    } else if (msecs < 100) {
        msecs = `0${msecs}`;
    }

    let seconds = Math.floor(time / 1000);
    let minutes = Math.floor(time / 60000);
    let hours = Math.floor(time / 3600000);
    seconds = seconds - minutes * 60;
    minutes = minutes - hours * 60;
    let formatted;
    if (type) {
        // formatted = `${hours < 10 ? 0 : ""}${hours}:${minutes < 10 ? 0 : ""
        // }${minutes}:${seconds < 10 ? 0 : ""}${seconds}`;
        formatted = `${hours > 0 ? hours + ' hr ' : ''}${minutes > 0 ? minutes + ' min ' : ''}${seconds > 0 ? seconds + ' sec' : ''}`;
        return formatted;
    }
    else {
        if (showMsecs) {
            formatted = `${hours < 10 ? 0 : ""}${hours}:${minutes < 10 ? 0 : ""
                }${minutes}:${seconds < 10 ? 0 : ""}${seconds}:${msecs}`;
        } else {
            formatted = `${hours < 10 ? 0 : ""}${hours}:${minutes < 10 ? 0 : ""
                }${minutes}:${seconds < 10 ? 0 : ""}${seconds}`;
        }

        return formatted;
    }

}
const JSFunctionUtils = {
    uniqueArray,
    sortByKey,
    getFlatArray,
    formatTimeString,
    uniqueArrayDate,
};
export default JSFunctionUtils
