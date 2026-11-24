import subject from "./assets/hero.webp"
import hero from "./assets/bg.webp"
import heroSm from "./assets/bg-sm.webp"
import img1 from "./assets/app/app1.webp"
import img2 from "./assets/app/app2.webp"
import img3 from "./assets/app/app3.webp"
import img4 from "./assets/app/app4.webp"
import img5 from "./assets/app/app5.webp"
 import app1 from "./assets/app/app6.webp"
import app2 from "./assets/app/app7.webp"
import screen from "./assets/screen.webp"
import prental from "./assets/programs/prenatal.webp";
import postnatal from "./assets/programs/postnatal.webp";
import healthcondition from "./assets/programs/withhealthconditions.webp";
import toneup from "./assets/programs/toneup.webp";
import nohealth from "./assets/programs/nocondition.webp";
import footerImg from "./assets/footer/footer.webp"
export const HERO_SRC = hero;
export const HERO_SRCSET = `${heroSm} 1000w, ${hero} 1920w`;           
export const SUBJECT_SRC = subject;        
export const APP_SRC = screen;            
export const CARD_IMAGES = [img1, img2, img3, img4, img5];        
export const whiteBag = app1;
export const blackBag = app2;
export const FOOTER_SRC = footerImg;
export const PROGRAM_IMAGES = [prental, postnatal, healthcondition, toneup, nohealth];