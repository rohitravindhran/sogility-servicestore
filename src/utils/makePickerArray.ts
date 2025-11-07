export function makePickerArray(data:any) {

// console.log('data', JSON.stringify(data))
    let pickerArray:any = [] ;
    data?.map((item:any)=>{
        pickerArray.push({
            label:item?.text,
            value:item?.text
        });
    })
  

    return pickerArray;

}