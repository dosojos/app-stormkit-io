import WorldMap from "react-svg-worldmap";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { grey } from "@mui/material/colors";
import Card from "~/components/Card";
import CardHeader from "~/components/CardHeader";
import CardFooter from "~/components/CardFooter";
import { useFetchByCountries } from "./actions";

interface Props {
  environment: Environment;
}

export default function TopReferrers({ environment }: Props) {
  const { countries, error, loading } = useFetchByCountries({
    envId: environment.id!,
  });

  return (
    <Card
      error={error}
      loading={loading}
      sx={{
        mt: 2,
        width: "100%",
        margin: "",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardHeader
        title="Countries"
        subtitle="The world map indicates the number of visitors per country."
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "black",
          mb: 4,
        }}
      >
        <WorldMap
          backgroundColor="transparent"
          borderColor="#fff"
          color="white"
          size="responsive"
          valueSuffix="visits"
          richInteraction
          data={countries}
        />
      </Box>
      <CardFooter sx={{ color: grey[500], textAlign: "left" }}>
        <Typography sx={{ fontSize: 12 }}>
          Double click to zoom in and out.
        </Typography>
      </CardFooter>
    </Card>
  );
}
