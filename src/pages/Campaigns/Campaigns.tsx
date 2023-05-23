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
} from "@chakra-ui/react";
import { HasNextPagination } from "@components";
import { useGetListCampaigns } from "@hooks/campaigns";
import { displayDateTime } from "@utils/date";
import React from "react";
import { FiPlus } from "react-icons/fi";
import { NavLink } from "react-router-dom";
export interface CampaignsProps {
  companyId: number;
}

export function Campaigns(props: CampaignsProps) {
  const { companyId } = props;
  const [currentPage, setCurrentPage] = React.useState(1);

  const campaigns = useGetListCampaigns({
    companyId: companyId,
    page: currentPage,
  });

  return (
    <Card px={8} py={4}>
      <Box display="flex">
        <Heading as="h1" size="xl" mb={4}>
          Campaigns
        </Heading>
        <Box as={NavLink} ml="auto" to="/campaigns/add">
          <IconButton
            aria-label="Add campaign"
            icon={<FiPlus />}
            variant="outline"
          />
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
