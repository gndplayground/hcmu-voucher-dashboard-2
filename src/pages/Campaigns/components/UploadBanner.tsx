import { Input, Button, IconButton, Box } from "@chakra-ui/react";
import { config } from "@configs";
import React from "react";
import { FiTrash } from "react-icons/fi";

interface UploadButtonProps {
  onChange: (file: File | null) => void;
  file?: File | null;
  defaultImage?: string | null;
  onRemoveDefaultImage?: () => void;
}

export function UploadBanner(props: UploadButtonProps) {
  const { onChange, file, defaultImage, onRemoveDefaultImage } = props;
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
      {!image && !defaultImage && (
        <Box w="200px" height="200px" border="1px dashed" />
      )}
      {(image || defaultImage) && (
        <Box w="200px" height="200px" border="1px dashed">
          <Box
            as="img"
            src={
              image || `${config.APP_IMAGE_END_POINT}/campaigns/${defaultImage}`
            }
            alt="Preview"
            w="100%"
            height="100%"
            objectFit="cover"
          />
        </Box>
      )}
      <Input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        display="none"
        accept="image/jpeg"
      />
      <Box mt={4} display="flex" alignItems="center">
        <Button onClick={() => inputRef.current?.click()}>Upload banner</Button>
        {(file || (!image && defaultImage)) && (
          <IconButton
            ml={4}
            aria-label="Delete image"
            colorScheme="red"
            onClick={() => {
              if (!image && defaultImage) {
                onRemoveDefaultImage?.();
              } else {
                onChange(null);
              }
            }}
          >
            <FiTrash />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
