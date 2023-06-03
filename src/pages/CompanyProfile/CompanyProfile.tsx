import {
  Box,
  Button,
  Card,
  Heading,
  IconButton,
  Input,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useGetCompanyDetail, useUpdateCompany } from "@hooks/company";
import { useAuthStore } from "@stores";
import { CompanyUpdate } from "@types";
import React from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { FormInput } from "@components";
import { FiTrash } from "react-icons/fi";
import { config } from "@configs";
import { useGetStores } from "@hooks/stores";
import { StoreLocation } from "./StoreLocation";
import { ModalStore } from "./ModalStore";
import { ModalStoreEdit } from "./ModalStoreEdit";

interface UploadButtonProps {
  onChange: (file: File | null) => void;
  file?: File | null;
  defaultValue?: string | null;
}

function UploadButton(props: UploadButtonProps) {
  const { onChange, file, defaultValue } = props;

  const [image, setImage] = React.useState<string | null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    onChange(selectedFile || null);
  }

  React.useEffect(() => {
    if (!file) {
      setImage(null);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  return (
    <Box>
      {!image && defaultValue && (
        <Box>
          <Box
            w="200px"
            as="img"
            src={config.APP_IMAGE_END_POINT + "/companies/" + defaultValue}
            alt="Preview"
            height="auto"
            objectFit="cover"
          />
        </Box>
      )}
      {!image ||
        (!defaultValue && <Box w="200px" height="200px" border="1px dashed" />)}
      {image && (
        <Box w="200px" height="200px" border="1px dashed">
          <Box
            w="200px"
            as="img"
            src={image}
            alt="Preview"
            height="auto"
            objectFit="cover"
          />
        </Box>
      )}
      <Input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        display="none"
        accept=".jpg,.jpeg,.png,.svg,.svg+xml"
      />
      <Box mt={4} display="flex" alignItems="center">
        <Button onClick={() => inputRef.current?.click()}>Change logo</Button>
        {file && (
          <IconButton
            ml={4}
            aria-label="Delete image"
            colorScheme="red"
            onClick={() => {
              onChange(null);
            }}
          >
            <FiTrash />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

const validationSchema = Yup.object<CompanyUpdate>().shape({
  name: Yup.string().max(128).required("Name is required"),
  address: Yup.string().max(256).optional().nullable(),
  phone: Yup.string().max(16).optional().nullable(),
  website: Yup.string().max(256).optional().nullable(),
  shouldDeletePhoto: Yup.boolean().optional().nullable(),
  logo: Yup.mixed()
    .test("fileType", "Invalid file type", (value: any) => {
      if (!value) return true;
      return ["image/jpeg", "image/png", "image/svg+xml"].includes(value.type);
    })
    .optional()
    .nullable(),
});

export function CompanyProfile() {
  const profile = useAuthStore((s) => s.profile);
  const createStoreModal = useDisclosure();
  const [editStore, setEditStore] = React.useState<number | undefined>();

  const company = useGetCompanyDetail(
    profile?.companyId ? Number(profile.companyId) : undefined
  );

  const stores = useGetStores({
    companyId: profile?.companyId ? Number(profile.companyId) : undefined,
    enabled: !!profile?.companyId,
  });

  const updateCompany = useUpdateCompany();

  const resolver = yupResolver(validationSchema);

  const form = useForm<CompanyUpdate>({
    resolver,
  });

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting, isDirty },
    watch,
    reset,
  } = form;

  async function onSubmit(data: CompanyUpdate) {
    await updateCompany.mutateAsync({
      id: Number(profile?.companyId),
      data,
    });
  }

  const logo = watch("logo");

  React.useEffect(() => {
    if (company.data && company.isFetchedAfterMount) {
      reset({
        name: company.data.name,
        address: company.data.address,
        phone: company.data.phone,
        website: company.data.website,
      });
    }
  }, [company.data, company.isFetchedAfterMount, reset, setValue]);

  return (
    <Card px={8} py={4}>
      <Box>
        <Heading as="h1" size="xl" mb={4}>
          Company Profile
        </Heading>
        <Button
          colorScheme="blue"
          variant="outline"
          onClick={createStoreModal.onOpen}
        >
          Add store
        </Button>
      </Box>
      <Box mt={4}>
        <StoreLocation
          stores={stores.data}
          onRequestEdit={(id) => {
            setEditStore(id);
          }}
        />
      </Box>
      {createStoreModal.isOpen && (
        <ModalStore
          isOpen={createStoreModal.isOpen}
          onClose={(success) => {
            if (success) {
              stores.refetch();
              company.refetch();
            }
            createStoreModal.onClose();
          }}
        />
      )}

      {editStore && (
        <ModalStoreEdit
          id={editStore}
          isOpen={true}
          onClose={(success) => {
            if (success) {
              stores.refetch();
              company.refetch();
            }
            setEditStore(undefined);
          }}
        />
      )}

      <Box
        w="800px"
        maxW="100%"
        mx="auto"
        as="form"
        mt={4}
        onSubmit={handleSubmit(onSubmit)}
      >
        <UploadButton
          defaultValue={company.data?.logo}
          file={logo}
          onChange={(file) => {
            setValue("logo", file || undefined);
          }}
        />
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
            id="website"
            inputProps={{
              ...register("website"),
            }}
            errors={errors}
            label="Website"
          />
        </Stack>
        <Box textAlign="center" mt={4}>
          <Button
            type="submit"
            isDisabled={isSubmitting || (!isDirty && !logo)}
            isLoading={isSubmitting}
            colorScheme="blue"
          >
            Edit
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
