import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { Box, Card, Heading, IconButton, Select } from "@chakra-ui/react";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Link, useParams } from "react-router-dom";
import {
  useGetCampaign,
  useGetCampaignStats,
  useGetDiscountQuestionsStats,
  useGetDiscountStats,
} from "@hooks/campaigns";
import {
  differenceInWeeks,
  startOfWeek,
  endOfWeek,
  addDays,
  endOfDay,
  isWithinInterval,
} from "date-fns";
import { FiArrowLeft } from "react-icons/fi";
import { VoucherQuestion, VoucherQuestionTypeEnum } from "@types";

ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.register(ChartDataLabels);
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const claimsData: ChartData<"pie"> = {
  labels: ["Voucher Claimed", "Voucher Unclaimed"],
  datasets: [
    {
      data: [1, 2],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

export function CampaignDetail() {
  const { id } = useParams();

  const campaign = useGetCampaign(id ? Number(id) : undefined);

  const [rangeWeeks, setRangeWeeks] = React.useState<
    { start: string; end: string }[]
  >([]);

  const [selectedWeek, setSelectedWeek] = React.useState<number | undefined>();

  const [selectedDiscountId, setSelectedDiscountId] = React.useState<
    number | undefined
  >();

  const [selectedWeekDiscount, setSelectedWeekDiscount] = React.useState<
    number | undefined
  >();

  const selectedDiscount = React.useMemo(() => {
    if (campaign.data) {
      return campaign.data.voucherDiscounts.find(
        (discount) => discount.id === selectedDiscountId
      );
    }
  }, [campaign.data, selectedDiscountId]);

  React.useEffect(() => {
    if (campaign.data) {
      setSelectedDiscountId(campaign.data.voucherDiscounts[0].id);
    }
  }, [campaign.data]);

  React.useEffect(() => {
    setSelectedWeek(undefined);
    setSelectedWeekDiscount(undefined);
    setRangeWeeks([]);
    if (
      campaign.data?.startDate &&
      campaign.data?.endDate &&
      new Date() > new Date(campaign.data.startDate)
    ) {
      const firstDayOfWeek = startOfWeek(new Date(campaign.data.startDate), {
        weekStartsOn: 1,
      });

      const lastDayOfWeek = endOfDay(
        endOfWeek(new Date(campaign.data.endDate), {
          weekStartsOn: 1,
        })
      );

      const totalWeeks = differenceInWeeks(lastDayOfWeek, firstDayOfWeek) + 1;

      const rangeWeeks: { start: string; end: string }[] = [];
      let selected = totalWeeks - 1;

      const firstDayOfWeekNow = startOfWeek(new Date(), {
        weekStartsOn: 1,
      });

      for (let i = 0; i < totalWeeks; i++) {
        const currentWeek = addDays(firstDayOfWeek, i * 7);
        const lastDayOfWeekCurrent = endOfDay(endOfWeek(currentWeek));
        rangeWeeks.push({
          start: currentWeek.toISOString(),
          end: lastDayOfWeekCurrent.toISOString(),
        });

        if (
          isWithinInterval(firstDayOfWeekNow.setMinutes(1), {
            start: currentWeek,
            end: lastDayOfWeekCurrent,
          })
        ) {
          selected = i;
        }
      }
      setSelectedWeekDiscount(selected);
      setRangeWeeks(rangeWeeks);
      setSelectedWeek(selected);
    }
  }, [campaign.data?.endDate, campaign.data?.startDate]);

  const startDate = React.useMemo(() => {
    if (selectedWeek !== undefined) {
      return new Date(rangeWeeks[selectedWeek].start);
    }
  }, [selectedWeek, rangeWeeks]);

  const stats = useGetCampaignStats({
    id: id ? Number(id) : undefined,
    start: startDate?.toISOString(),
  });

  const startDateDiscount = React.useMemo(() => {
    if (selectedWeekDiscount !== undefined) {
      return new Date(rangeWeeks[selectedWeekDiscount].start);
    }
  }, [selectedWeekDiscount, rangeWeeks]);

  const discountStats = useGetDiscountStats({
    campaignId: id ? Number(id) : undefined,
    id: selectedDiscountId,
    start: startDateDiscount?.toISOString(),
  });

  const discountQuestionStats = useGetDiscountQuestionsStats({
    campaignId: id ? Number(id) : undefined,
    id: selectedDiscountId,
  });

  const claimsBy = React.useMemo<ChartData<"bar"> | undefined>(() => {
    if (stats.data?.claimedByWeek && selectedWeek !== undefined) {
      const range = rangeWeeks[selectedWeek];
      return {
        labels: Object.keys(stats.data.claimedByWeek),
        datasets: [
          {
            label: `Claimed from ${new Date(
              range.start
            ).toLocaleDateString()} to ${new Date(
              range.end
            ).toLocaleDateString()}`,
            data: Object.values(stats.data.claimedByWeek),
            backgroundColor: "rgba(255, 99, 132, 0.5)",
          },
        ],
      };
    }
  }, [rangeWeeks, selectedWeek, stats.data?.claimedByWeek]);

  const claimData = React.useMemo<ChartData<"pie"> | undefined>(() => {
    if (stats.data?.claimed && stats.data?.unclaimed) {
      return {
        labels: ["Claimed", "Unclaimed"],
        datasets: [
          {
            label: "Claimed",

            data: [stats.data?.claimed || 0, stats.data?.unclaimed || 0],
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      };
    }
  }, [stats.data?.claimed, stats.data?.unclaimed]);

  const claimDataDiscount = React.useMemo<ChartData<"pie"> | undefined>(() => {
    if (discountStats.data?.claimed && discountStats.data?.unclaimed) {
      return {
        labels: ["Claimed", "Unclaimed"],
        datasets: [
          {
            label: "Claimed",

            data: [
              discountStats.data?.claimed || 0,
              discountStats.data?.unclaimed || 0,
            ],
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
            ],
            borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
            borderWidth: 1,
          },
        ],
      };
    }
  }, [discountStats.data?.claimed, discountStats.data?.unclaimed]);

  const claimsByDiscount = React.useMemo<ChartData<"bar"> | undefined>(() => {
    if (
      discountStats.data?.claimedByWeek &&
      selectedWeekDiscount !== undefined
    ) {
      const range = rangeWeeks[selectedWeekDiscount];
      return {
        labels: Object.keys(discountStats.data.claimedByWeek),
        datasets: [
          {
            label: `Claimed from ${new Date(
              range.start
            ).toLocaleDateString()} to ${new Date(
              range.end
            ).toLocaleDateString()}`,
            data: Object.values(discountStats.data.claimedByWeek),
            backgroundColor: "rgba(255, 99, 132, 0.5)",
          },
        ],
      };
    }
  }, [rangeWeeks, selectedWeekDiscount, discountStats.data?.claimedByWeek]);

  // const questionsData = React.useMemo<
  //   { chart: ChartData<"bar">; question: VoucherQuestion }[] | undefined
  // >(() => {
  //   if (discountStats.data?.questions) {
  //     return discountStats.data?.questions.map((q) => ({
  //       question: q,
  //       chart: {
  //         labels: q.voucherQuestionChoices?.map((c) => c.choice) || [],
  //         datasets: [
  //           {
  //             label: q.type,
  //             data: q.voucherQuestionChoices?.map((c) => c.count || 0) || [],
  //             backgroundColor: "rgba(255, 99, 132, 0.5)",
  //           },
  //         ],
  //       },
  //     }));
  //   }
  // }, [discountStats.data?.questions]);

  const questionAllStats = React.useMemo<
    { chart: ChartData<"bar">; question: VoucherQuestion }[] | undefined
  >(() => {
    if (discountQuestionStats.data?.questions) {
      return discountQuestionStats.data?.questions.map((q) => ({
        question: q,
        chart: {
          labels: q.voucherQuestionChoices?.map((c) => c.choice) || [],
          datasets: [
            {
              label: q.type,
              data: q.voucherQuestionChoices?.map((c) => c.count || 0) || [],
              backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
          ],
        },
      }));
    }
  }, [discountQuestionStats.data?.questions]);

  return (
    <Card px={8} py={4} minH={700}>
      <Box display="lef">
        <IconButton aria-label="Back" as={Link} to={`/campaigns`}>
          <FiArrowLeft />
        </IconButton>
        <Heading as="h1" size="xl" ml={4}>
          Campaign: {campaign.data?.name}
        </Heading>
      </Box>
      {claimData && (
        <Box mt={4} display="flex" justifyContent="center">
          <Box width="240px">
            <Pie data={claimData} />
          </Box>
        </Box>
      )}
      {claimsBy && (
        <Box width="100%" mt={6}>
          <Heading as="h2" size="lg" textAlign="center">
            Claimed by week
          </Heading>
          <Box display="flex" justifyContent="center">
            <Select
              w={500}
              mt={4}
              value={selectedWeek}
              onChange={(e) => {
                setSelectedWeek(Number(e.target.value));
              }}
            >
              {rangeWeeks.map((week, index) => (
                <option key={index} value={index}>
                  {new Date(week.start).toLocaleDateString()} -{" "}
                  {new Date(week.end).toLocaleDateString()}
                </option>
              ))}
            </Select>
          </Box>
          <Box
            mt={4}
            height="500px"
            width="100%"
            display="flex"
            justifyContent="center"
          >
            <Bar options={{}} data={claimsBy} />
          </Box>
        </Box>
      )}
      <Box minH={1000}>
        {campaign.data && selectedDiscount && (
          <Box mt={8}>
            <Box display="flex" justifyContent="center">
              <Select
                w={500}
                mt={4}
                value={selectedDiscountId}
                onChange={(e) => {
                  setSelectedDiscountId(Number(e.target.value));
                }}
              >
                {campaign.data.voucherDiscounts.map((discount, index) => (
                  <option key={index} value={discount.id}>
                    Discount {discount.type}: {discount.discount}
                  </option>
                ))}
              </Select>
            </Box>
            <Box mt={4}>
              <Heading as="h3" size="md" textAlign="center">
                Discount {selectedDiscount.type}: {selectedDiscount.discount}
              </Heading>
            </Box>
            {claimDataDiscount && (
              <Box mt={4} display="flex" justifyContent="center">
                <Box width="240px">
                  <Pie data={claimDataDiscount} />
                </Box>
              </Box>
            )}
            {claimsByDiscount && (
              <Box width="100%" mt={6}>
                <Heading as="h3" size="lg" textAlign="center">
                  Claimed by week
                </Heading>
                <Box display="flex" justifyContent="center">
                  <Select
                    w={500}
                    mt={4}
                    value={selectedWeekDiscount}
                    onChange={(e) => {
                      setSelectedWeekDiscount(Number(e.target.value));
                    }}
                  >
                    {rangeWeeks.map((week, index) => (
                      <option key={index} value={index}>
                        {new Date(week.start).toLocaleDateString()} -{" "}
                        {new Date(week.end).toLocaleDateString()}
                      </option>
                    ))}
                  </Select>
                </Box>
                <Box
                  mt={4}
                  height="500px"
                  width="100%"
                  display="flex"
                  justifyContent="center"
                >
                  <Bar options={{}} data={claimsByDiscount} />
                </Box>
                {questionAllStats && questionAllStats?.length > 0 && (
                  <Box mt={6}>
                    <Heading as="h3" size="lg" textAlign="center">
                      Questions stats
                    </Heading>
                    <Box maxW="1200px" mx="auto">
                      {questionAllStats?.map((q, index) => (
                        <Box key={index} mt={8}>
                          <Heading as="h4" size="md" textAlign="center">
                            Question: {q.question.question}
                          </Heading>
                          {(q.question.type ===
                            VoucherQuestionTypeEnum.MULTIPLE_CHOICE ||
                            q.question.type ===
                              VoucherQuestionTypeEnum.SINGLE_CHOICE) && (
                            <Box mt={4} display="flex" justifyContent="center">
                              <Box
                                width="100%"
                                height={300}
                                display="flex"
                                justifyContent="center"
                              >
                                <Bar options={{}} data={q.chart} />
                              </Box>
                            </Box>
                          )}
                          {q.question.type === VoucherQuestionTypeEnum.FREE && (
                            <Box>FREE TEXT</Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Card>
  );
}
