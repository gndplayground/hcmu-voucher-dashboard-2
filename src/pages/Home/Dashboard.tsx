import { Box, Card, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { useGetStats } from "@hooks/home";
import { useAuthStore } from "@stores";
import React from "react";

export function Dashboard() {
  const profile = useAuthStore((state) => state.profile);
  const stats = useGetStats(profile?.id);
  return (
    <Box>
      <SimpleGrid columns={3} spacing={10}>
        <Card p={4}>
          <Heading as="h2" fontSize="1rem">
            Active campaigns
          </Heading>
          <Text textAlign="right" mt={4} fontSize="1.5rem" fontWeight="bold">
            {stats.data?.activeCampaigns}
          </Text>
        </Card>
        <Card p={4}>
          <Heading as="h2" fontSize="1rem">
            Upcoming campaigns
          </Heading>
          <Text textAlign="right" mt={4} fontSize="1.5rem" fontWeight="bold">
            {stats.data?.upcomingCampaigns}
          </Text>
        </Card>
        <Card p={4}>
          <Heading as="h2" fontSize="1rem">
            Expire campaigns
          </Heading>
          <Text textAlign="right" mt={4} fontSize="1.5rem" fontWeight="bold">
            {stats.data?.pastCampaigns}
          </Text>
        </Card>
        <Card p={4}>
          <Heading as="h2" fontSize="1rem">
            Total vouchers claimed
          </Heading>
          <Text textAlign="right" mt={4} fontSize="1.5rem" fontWeight="bold">
            {stats.data?.claimedVouchers}
          </Text>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
