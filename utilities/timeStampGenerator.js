module.exports = timeStampGenerator = () => {
    let date = new Date();
    
    let day = date.getDate();
    let realDay; 
    if(day < 10){
      realDay = '0' + day
    } else {
      realDay = day
    }
    
    let month = date.getMonth() + 1;
    let year = date.getFullYear()
    let hour = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    return `${realDay}-${month}-${year} ${hour}:${minutes}:${seconds}`
}