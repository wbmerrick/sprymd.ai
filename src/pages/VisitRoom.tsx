import { useSearchParams, useParams } from "react-router-dom";
import ConsultationRoom from "@/components/visit/ConsultationRoom";
import type { VisitRole } from "@/types/telehealth";

const VisitRoomPage = () => {
  const { appointmentId = "upcoming" } = useParams();
  const [params] = useSearchParams();
  const roleParam = params.get("role");
  const role: VisitRole = roleParam === "provider" ? "provider" : "patient";
  const displayName = params.get("name") || (role === "provider" ? "Provider" : "Patient");

  return (
    <ConsultationRoom
      appointmentId={appointmentId}
      role={role}
      displayName={displayName}
    />
  );
};

export default VisitRoomPage;
