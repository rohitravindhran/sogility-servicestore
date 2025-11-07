import { AsyncValues } from "../../constants/AsyncStorage";
import { Strings } from "../../constants/Strings";
import StaticVariables from "../../preference/StaticVariables";

 const createDataFromNotification = async (storeURL:string) => {
   
        AsyncValues.setItem(Strings.openWithNotification, JSON.stringify(false));


        var target = await AsyncValues.getItem(Strings.notificationTarget);
        var data = await AsyncValues.getItem(Strings.notificationData);
        console.log('notification_data', data);
        
        var isMainRoute = StaticVariables.BOTTOM_MENU.some((item:any)=>item?.route == data);

    
        let initialURL =   data != '' ?  `${storeURL}/${target}/${data}` : `${storeURL}/${target}`  ;
        
         return {initialURL,isMainRoute};
      }
    



export default createDataFromNotification;
