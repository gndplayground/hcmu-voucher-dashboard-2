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
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ConfirmModal, FormInput } from "@components";
import { config } from "@configs";
import { yupResolver } from "@hookform/resolvers/yup";
import { useGetStoreDetail, useUpdateStore } from "@hooks/stores";
import { StoreCreate, StoreUpdate } from "@types";
import GoogleMap from "google-maps-react-markers";
import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { FiShoppingCart } from "react-icons/fi";
import * as Yup from "yup";

export interface ModalStoreProps {
  isOpen?: boolean;
  onClose: (success?: boolean) => void;
  id?: number;
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

export function ModalStoreEdit(props: ModalStoreProps) {
  const { isOpen, onClose } = props;
  const [mapReady, setMapReady] = React.useState(false);
  const mapRef = useRef<null | google.maps.Map>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState<
    undefined | number
  >();

  const [market, setMarker] = React.useState<
    { lat: number; lng: number } | undefined
  >();

  const store = useGetStoreDetail(props.id);

  const update = useUpdateStore();

  const resolver = yupResolver(validationSchema);

  function handleConfirmDelete() {
    if (isConfirmModalOpen && props.id) {
      update.mutate({
        id: props.id,
        data: {
          isDeleted: true,
        },
      });
      onClose(true);
    }
  }

  const form = useForm<StoreUpdate>({
    resolver,
  });

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  React.useEffect(() => {
    if (mapReady && store.isFetchedAfterMount && store.data) {
      reset({
        name: store.data.name,
        address: store.data.address,
        phone: store.data.phone,
        openAt: store.data.openAt,
        closeAt: store.data.closeAt,
      });
      if (store.data.latitude && store.data.longitude) {
        setMarker({
          lat: store.data.latitude,
          lng: store.data.longitude,
        });
        mapRef?.current?.setCenter({
          lat: store.data.latitude,
          lng: store.data.longitude,
        });
        mapRef?.current?.setZoom(defaultProps.zoom);
      }
    }
  }, [mapReady, reset, store.data, store.isFetchedAfterMount]);

  async function onSubmit(data: StoreUpdate) {
    if (!props.id) return;
    try {
      await update.mutateAsync({
        id: props.id,
        data: {
          ...data,
          latitude: market?.lat,
          longitude: market?.lng,
        },
      });
      onClose(true);
    } catch (error) {
      //
    }
  }

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
    setMapReady(true);
  };

  return (
    <>
      <ConfirmModal
        title="Confirm delete the store?"
        isOpen={!!isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(undefined);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={update.isLoading}
      />
      <Modal
        isOpen={!!isOpen}
        onClose={() => {
          if (!isSubmitting) onClose();
        }}
        size="full"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit store {store.data?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box>
              <Button
                colorScheme="red"
                disabled={!store.isFetchedAfterMount}
                onClick={() => {
                  setIsConfirmModalOpen(props.id);
                }}
              >
                Delete this store
              </Button>
            </Box>
            <Box mt={4}>
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
            {!mapReady && <Spinner />}
            {mapReady && (
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
                    Update
                  </Button>
                </Box>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
