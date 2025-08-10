import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// This route now simply redirects to the unified /properties page, preserving query params
const MapSearch = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ pathname: "/properties", search: location.search }, { replace: true });
  }, [location.search, navigate]);

  return null;
};

export default MapSearch;