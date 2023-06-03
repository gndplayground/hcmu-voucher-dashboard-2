// generate charka ui modal component
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FormInput } from "@components";
import { config } from "@configs";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCreateStore } from "@hooks/stores";
import { StoreCreate } from "@types";
import GoogleMap from "google-maps-react-markers";
import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { FiShoppingCart } from "react-icons/fi";
import * as Yup from "yup";

export interface ModalStoreProps {
  isOpen?: boolean;
  onClose: (success?: boolean) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Point = (props: { lat: number; lng: number }) => (
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

const defaultProps = {
  center: {
    lat: 10.81725513824529,
    lng: 106.62871446607583,
  },
  zoom: 15,
};

const validationSchema = Yup.object<StoreCreate>().shape({
  name: Yup.string().max(128).required("Name is required"),
  latitude: Yup.number().optional().nullable(),
  longitude: Yup.number().optional().nullable(),
  address: Yup.string().max(256).optional().nullable(),
  phone: Yup.string().max(16).optional().nullable(),
  openAt: Yup.string().max(20).optional().nullable(),
  closeAt: Yup.string().max(20).optional().nullable(),
});

export function ModalStore(props: ModalStoreProps) {
  const { isOpen, onClose } = props;

  const [market, setMarker] = React.useState<
    { lat: number; lng: number } | undefined
  >();

  const create = useCreateStore();

  const resolver = yupResolver(validationSchema);

  const form = useForm<StoreCreate>({
    resolver,
  });

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(data: StoreCreate) {
    await create.mutateAsync({
      ...data,
      latitude: market?.lat,
      longitude: market?.lng,
    });
    onClose(true);
  }

  const mapRef = useRef<any>(null);

  const onGoogleApiLoaded = ({
    map,
    maps,
  }: {
    map: google.maps.Map;
    maps: typeof google.maps;
  }) => {
    mapRef.current = map;
    map.addListener("click", (mapsMouseEvent: any) => {
      const geo = new maps.Geocoder();
      geo.geocode({ location: mapsMouseEvent.latLng }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          setValue("address", results[0].formatted_address);
        }
      });
      setMarker({
        lat: mapsMouseEvent.latLng.lat(),
        lng: mapsMouseEvent.latLng.lng(),
      });
    });
  };

  return (
    <Modal
      isOpen={!!isOpen}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      size="full"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create store</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box>
            <Text>Click on the map to add marker for store location.</Text>
          </Box>
          <Box h={500} mt={4}>
            <GoogleMap
              apiKey={config.APP_GOOGLE_MAP_API_KEY}
              defaultCenter={{
                lat: defaultProps.center.lat,
                lng: defaultProps.center.lng,
              }}
              defaultZoom={defaultProps.zoom}
              onGoogleApiLoaded={onGoogleApiLoaded}
            >
              {market && <Point lat={market.lat} lng={market.lng} />}
            </GoogleMap>
          </Box>
          <Box
            w="800px"
            maxW="100%"
            mx="auto"
            as="form"
            mt={4}
            onSubmit={handleSubmit(onSubmit)}
          >
            {market && (
              <Text fontSize="sm">
                Store location: Lat {market.lat} - Lng {market.lng}
              </Text>
            )}
            <Stack mt={4} w="100%" spacing={4}>
              <FormInput
                isRequired={true}
                disabled={isSubmitting}
                id="name"
                inputProps={{
                  ...register("name"),
                }}
                errors={errors}
                label="Name"
              />
              <FormInput
                disabled={isSubmitting}
                id="address"
                inputProps={{
                  ...register("address"),
                }}
                errors={errors}
                label="Address"
              />
              <FormInput
                disabled={isSubmitting}
                id="phone"
                inputProps={{
                  ...register("phone"),
                }}
                errors={errors}
                label="Phone"
              />
              <FormInput
                disabled={isSubmitting}
                id="openAt"
                inputProps={{
                  ...register("openAt"),
                }}
                errors={errors}
                label="Open at"
              />
              <FormInput
                disabled={isSubmitting}
                id="closeAt"
                inputProps={{
                  ...register("closeAt"),
                }}
                errors={errors}
                label="Close at"
              />
            </Stack>
            <Box textAlign="center" mt={4}>
              <Button
                type="submit"
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
                colorScheme="blue"
              >
                Create
              </Button>
            </Box>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
