import config from '../../env.config';
import { Constants as OmnifyConstants } from './omnify/Constants';
import { Colors as OmnifyColors} from './omnify/Colors';
import { Images as OmnifyImages} from './omnify/Images';
import { Strings as OmnifyStrings } from './omnify/Strings';
import { Constants as LuminaConstants } from './lumina/Constants';
import { Colors as LuminaColors} from './lumina/Colors';
import { Images as LuminaImages} from './lumina/Images';
import { Strings as LuminaStrings } from './lumina/Strings';

const brand: string = config.env;

interface BrandConstants {
  Constants: any;
  Images: any; 
  Strings: any; 
  Colors: any; 
}

interface BrandMap {
  [key: string]: BrandConstants;
}

const brands: BrandMap = {
  lumina: {
    Constants:LuminaConstants ,
    Images: LuminaImages,
    Strings: LuminaStrings,
    Colors: LuminaColors,
  },
  omnify: {
    Constants: OmnifyConstants,
    Images: OmnifyImages,
    Strings: OmnifyStrings,
    Colors: OmnifyColors,
  },
};

const brandedConstants: BrandConstants | undefined = brands[brand];

export default brandedConstants;
