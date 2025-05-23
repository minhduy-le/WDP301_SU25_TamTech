import LatestTransaction from "../../components/manager/dashboard/LatestTransaction";
import MonthlyEarnings from "../../components/manager/dashboard/MonthlyEarnings";
import Satistics from "../../components/manager/dashboard/Satistics";

export default function Dashboard() {
  return (
    <div style={{ background: "#fff7e6", padding: "20px 30px 30px 60px" }}>
      <Satistics />
      <MonthlyEarnings />
      <LatestTransaction />
    </div>
  );
}
