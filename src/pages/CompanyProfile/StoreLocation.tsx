import { useRef } from "react";
import GoogleMap from "google-maps-react-markers";
import { FiEdit, FiShoppingCart, FiZoomIn } from "react-icons/fi";
import { Box, IconButton, Text } from "@chakra-ui/react";
import { config } from "@configs";
import { Store } from "@types";

const defaultProps = {
  center: {
    lat: 10.81725513824529,
    lng: 106.62871446607583,
  },
  zoom: 11,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Point = ({ text }: { lat: number; lng: number; text: string }) => (
  <Box
    bg="white"
    p={2}
    border="1px solid"
    borderColor="blue.500"
    borderRadius="50%"
    fontSize="1.5rem"
    color="blue.500"
  >
    <FiShoppingCart />
  </Box>
);

export function StoreLocation(props: {
  stores?: Store[];
  onRequestEdit: (id: number) => void;
}) {
  const { stores, onRequestEdit } = props;
  const mapRef = useRef<null | google.maps.Map>(null);

  const onGoogleApiLoaded = ({ map }: any) => {
    mapRef.current = map;
  };

  const handleZoomToStore = (lat: number, lng: number) => {
    return () => {
      mapRef.current?.setCenter({ lat, lng });
      mapRef.current?.setZoom(18);
    };
  };

  return (
    <Box h={500} pos="relative">
      <Box
        w={300}
        height="90%"
        top={2}
        bottom={2}
        left={2}
        pos="absolute"
        bg="white"
        zIndex={1}
        shadow="md"
        overflow="auto"
        py={4}
        px={4}
      >
        <Box borderBottom="1px solid" borderColor="#ccc">
          {stores?.map((store) => (
            <Box key={store.id} py={2} borderTop="1px solid" borderColor="#ccc">
              <Text fontWeight={700}>{store.name}</Text>
              <Text>{store.address}</Text>
              <Box display="flex" mt={2}>
                <IconButton
                  aria-label="edit"
                  onClick={() => {
                    onRequestEdit(store.id);
                  }}
                >
                  <FiEdit />
                </IconButton>
                {!!(store.latitude && store.longitude) && (
                  <IconButton
                    ml={4}
                    aria-label="zoom to store"
                    onClick={handleZoomToStore(store.latitude, store.longitude)}
                  >
                    <FiZoomIn />
                  </IconButton>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      <GoogleMap
        apiKey={config.APP_GOOGLE_MAP_API_KEY}
        defaultCenter={{
          lat: defaultProps.center.lat,
          lng: defaultProps.center.lng,
        }}
        defaultZoom={5}
        onGoogleApiLoaded={onGoogleApiLoaded}
      >
        {stores
          ?.filter((s) => {
            return !!(s.latitude && s.longitude);
          })
          .map((store) => {
            return (
              <Point
                key={store.id}
                lat={store.latitude || 0}
                lng={store.longitude || 0}
                text={store.name}
              />
            );
          })}
      </GoogleMap>
    </Box>
  );
}
