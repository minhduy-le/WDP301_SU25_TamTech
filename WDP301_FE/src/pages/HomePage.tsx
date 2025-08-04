import HeroSection from "../components/home/HeroSection";
import WhyChooseUs from "../components/home/WhyChooseUs";
import BestSellers from "../components/home/BestSellers";
import AboutUs from "../components/home/AboutUs";
import OurMenu from "../components/home/OurMenu";
// import ChatWidget from "../components/home/ChatWidget";
const HomePage = () => (
  <>
    <HeroSection />
    <OurMenu />
    <BestSellers />
    <WhyChooseUs />
    <AboutUs />
    {/* <ChatWidget /> */}
  </>
);

export default HomePage;
