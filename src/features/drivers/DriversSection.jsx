import { useCallback, useEffect, useRef, useState } from "react";
import geography from "../../data/provinces-metadata.json";
import { DriversSection as DriversSectionMarkup } from "../../sections/HomeMarkup.jsx";

export function DriversSection() {
  const [provinceId, setProvinceId] = useState("tehran");
  const [vehicle, setVehicle] = useState("all");
  const [paths, setPaths] = useState(null);
  const [mapState, setMapState] = useState("idle");
  const sectionRef = useRef(null);
  const province =
    geography.provinces.find((item) => item.id === provinceId) ||
    geography.provinces[0];

  const loadPaths = useCallback(() => {
    setMapState("loading");
    import("../../data/province-paths.json")
      .then(({ default: data }) => {
        setPaths(data.paths);
        setMapState("ready");
      })
      .catch(() => setMapState("error"));
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) {
      loadPaths();
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        loadPaths();
      },
      { rootMargin: "800px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [loadPaths]);

  return (
    <DriversSectionMarkup
      province={province}
      provinces={geography.provinces}
      vehicle={vehicle}
      paths={paths}
      mapState={mapState}
      sectionRef={sectionRef}
      onMapRetry={loadPaths}
      onProvinceChange={setProvinceId}
      onVehicleChange={setVehicle}
    />
  );
}
