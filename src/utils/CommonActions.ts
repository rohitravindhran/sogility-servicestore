import { Images } from "@constants/Images";
import StaticVariables from "src/preference/StaticVariables";

export const getFirstLettersFromName = (firstName: string | null, lastName: string | null): string => {
  let name = '';

  if (firstName !== null && firstName.trim() !== '') {
    name = firstName.charAt(0);
  }

  if (lastName !== null && lastName.length > 0) {
    name += lastName.charAt(0);
  } else if (firstName !== null) {
    const values = firstName.split(' ');

    if (values.length > 1) {
      name += values[1]?.charAt(0) || '';
    }
  }

  return name.toUpperCase();
};


export const getTabMenu = (menus: any) => {
  const menu = StaticVariables.BOTTOM_MENU;
  let menuData: any = [];
  menu.map((route: any) => {
    menus.map((item: any) => {
      if (item?.link?.replace('/', '') == route?.route) {
        if (item.isShown == true) {
          menuData?.push({...route,label:item?.name});
        }
      }
    });
   
  });


//Add profile to menu
  menuData?.push({
    label: 'Profile',
    route: 'profile',
    icon: Images.profileMenu,
  });

  return menuData;
};

export const createMultilocationArray = (data:any,masterURL:String) => {

  let dataArray = [{url:masterURL,isMaster:true}];

  data?.map((item:any) => {

   dataArray.push({url:item?.storeUrl,isMaster:false})
  })
   console.log('dataArray----', dataArray)      ;
  return dataArray;

}