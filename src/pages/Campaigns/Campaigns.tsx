import {
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  Box,
  IconButton,
  Input,
} from "@chakra-ui/react";
import { ConfirmModal, HasNextPagination } from "@components";
import { useGetListCampaigns, useUpdateCampaign } from "@hooks/campaigns";
import { displayDateTime } from "@utils/date";
import React from "react";
import { FiDelete, FiEdit3, FiPlus } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import debounce from "lodash.debounce";
export interface CampaignsProps {
  companyId: number;
}

export function Campaigns(props: CampaignsProps) {
  const { companyId } = props;
  const [currentPage, setCurrentPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState<
    undefined | number
  >();

  const campaigns = useGetListCampaigns({
    companyId: companyId,
    page: currentPage,
    search,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleOnChange = React.useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setCurrentPage(1);
    }, 500),
    []
  );

  const updateCamp = useUpdateCampaign();

  async function handleConfirmDelete() {
    if (isConfirmModalOpen) {
      await updateCamp.mutateAsync({
        id: isConfirmModalOpen,
        data: {
          isDeleted: true,
        },
      });

      await campaigns.refetch();

      setIsConfirmModalOpen(undefined);
    }
  }

  React.useEffect(() => {
    if (currentPage > 1 && campaigns.data?.data.length === 0) {
      setCurrentPage(1);
    }
  }, [campaigns.data?.data.length, currentPage, search]);

  return (
    <Card px={8} py={4}>
      <ConfirmModal
        title="Confirm delete the campaign?"
        isOpen={!!isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(undefined);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={updateCamp.isLoading}
      />
      <Box display="flex" alignItems="center">
        <Heading as="h1" size="xl" mb={4}>
          Campaigns
        </Heading>
        <Box ml="auto" display="flex">
          <Input placeholder="Search" onChange={handleOnChange} />
          <Box as={NavLink} ml={4} to="/campaigns/add">
            <IconButton
              aria-label="Add campaign"
              icon={<FiPlus />}
              variant="outline"
            />
          </Box>
        </Box>
      </Box>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Name</Th>
            <Th>Claim type</Th>
            <Th>Start date</Th>
            <Th>End date</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {campaigns.data?.data?.map((camp) => (
            <Tr key={camp.id}>
              <Td>{camp.id}</Td>
              <Td>{camp.name}</Td>
              <Td>{camp.claimType}</Td>
              <Td>{displayDateTime(camp.startDate)}</Td>
              <Td>{displayDateTime(camp.endDate)}</Td>
              <Td>
                <Box display="flex">
                  <Box as={NavLink} to={`/campaigns/${camp.id}`}>
                    <IconButton
                      aria-label="Edit campaign"
                      icon={<FiEdit3 />}
                      variant="outline"
                    />
                  </Box>
                  {new Date(camp.endDate).getTime() > new Date().getTime() && (
                    <Box ml={4}>
                      <IconButton
                        aria-label="Edit campaign"
                        icon={<FiDelete />}
                        colorScheme="red"
                        onClick={() => {
                          setIsConfirmModalOpen(camp.id);
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <HasNextPagination
        currentPage={currentPage}
        hasNextPage={campaigns.data?.meta?.hasNextPage || false}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </Card>
  );
}
