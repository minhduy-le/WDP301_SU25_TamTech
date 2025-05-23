import LatestTransaction from "../components/admin/Dashboard/LatestTransaction";
import MonthlyEarnings from "../components/admin/Dashboard/MonthlyEarnings";
import Satistics from "../components/admin/Dashboard/Satistics";

export default function Dashboard() {
  return (
    <div style={{ background: "#fff7e6", padding: 30, paddingTop: 20 }}>
      <Satistics />
      <MonthlyEarnings />
      <LatestTransaction />
    </div>
  );
}
