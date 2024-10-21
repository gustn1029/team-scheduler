import React, { useEffect, useRef, useState } from "react";
import { useKakaoLoader } from "../../hooks/useKakaoLoader";
import styles from "./kakaoMap.module.scss";

interface KakaoMapProps {
  latitude: number;
  longitude: number;
  level?: number;
}

const KakaoMap: React.FC<KakaoMapProps> = ({
  latitude,
  longitude,
  level = 3,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const isLoaded = useKakaoLoader();
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      const options = {
        center: new window.kakao.maps.LatLng(latitude, longitude),
        level: level,
      };

      const newMap = new window.kakao.maps.Map(mapRef.current, options);
      setMap(newMap);

      const markerPosition = new window.kakao.maps.LatLng(latitude, longitude);
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
      });

      marker.setMap(newMap);
    }
  }, [isLoaded, latitude, longitude, level, map]);

  useEffect(() => {
    if (map) {
      map.relayout();
    }
  }, [map]);

  return (
    <section className={styles.mapContainer}>
      {!isLoaded && <div>Loading map...</div>}
      <div ref={mapRef} className={styles.kakaoMap} />
    </section>
  );
};

export default KakaoMap;
