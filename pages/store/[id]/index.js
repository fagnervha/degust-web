import React, { useEffect, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { useDispatch } from "react-redux";
import {NoSsr, CircularProgress, Box, Typography, Skeleton} from "@mui/material";
import Router, { useRouter } from "next/router";
import SEO from "../../../src/components/seo";
import MainLayout from "../../../src/components/layout/MainLayout";
import StoreDetails from "../../../src/components/store-details";
import useScrollToTop from "../../../src/api-manage/hooks/custom-hooks/useScrollToTop";
import {config_api, store_details_api} from "../../../src/api-manage/ApiRoutes";
import {setConfigData} from "../../../src/redux/slices/configData";
import CustomContainer from "../../../src/components/container";

const StorePage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  useScrollToTop();

  const { id: storeId, module_id: moduleId, lat, lng, distance } = router.query;

  const [loading, setLoading] = useState(true);
  const [configData, setConfig] = useState(null);
  const [storeDetails, setStoreDetails] = useState(null);
  const [error, setError] = useState(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const origin = process.env.NEXT_CLIENT_HOST_URL;

  const fetchData = async () => {
    if (!storeId) return; // wait until router is ready
    setLoading(true);
    setError(null);

    try {
      const language =
        (typeof window !== "undefined" &&
          localStorage.getItem("languageSetting")) ||
        "en";

      const headersCommon = {
        "X-software-id": 33571750,
        "X-server": "server",
        origin,
        "X-localization": language,
      };

      console.log("Fetching config & store data...");

      const [configRes, storeRes] = await Promise.all([
        fetch(`${baseUrl}${config_api}`, {
          headers: { ...headersCommon, lat, lng },
        }),
        fetch(`${baseUrl}${store_details_api}/${storeId}`, {
          headers: { ...headersCommon, moduleId },
        }),
      ]);

      if (!configRes.ok || !storeRes.ok) {
        throw new Error("One or more API calls failed");
      }

      const configData = await configRes.json();
      const storeData = await storeRes.json();

      setConfig(configData);
      setStoreDetails(storeData);
      dispatch(setConfigData(configData));

      // Store recently visited stores
      manageVisitedStores(storeData);

      setLoading(false);
    } catch (err) {
      console.error("Client-side fetch error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const manageVisitedStores = (storeData) => {
    const key = "visitedStores";
    try {
      const stored = localStorage.getItem(key);
      const visitedStores = stored ? JSON.parse(stored) : [];
      const alreadyVisited = visitedStores.some(
        (store) => store?.id === storeData?.id
      );
      if (!alreadyVisited) {
        visitedStores.push({ ...storeData, distance });
        localStorage.setItem(key, JSON.stringify(visitedStores));
      }
    } catch {
      // ignore errors
    }
  };

  useEffect(() => {
    if (router.isReady) fetchData();
  }, [router.isReady, storeId]);




  const metaTitle = `${storeDetails?.meta_title || storeDetails?.name} - ${
    configData?.business_name
  }`;
  const metaImage =
    storeDetails?.meta_image_full_url || storeDetails?.cover_photo_full_url;

  return (
    <>
      <CssBaseline />
      <SEO
        title={metaTitle}
        image={metaImage}
        businessName={configData?.business_name}
        description={storeDetails?.meta_description}
        configData={configData}
      />
      <MainLayout configData={configData}>
        <NoSsr>
          {!loading?(
            <StoreDetails loading={loading}   storeDetails={storeDetails} configData={configData} />
          ):(
            <CustomContainer>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                paddingTop:"2rem",
                minHeight: "50vh",
                width: "100%",
                px: 2,
              }}
            >
              {/* Store banner skeleton */}
              <Skeleton
                variant="rectangular"
                width="100%"
                height={300}
                sx={{ borderRadius: 2, mb: 2 }}
              />

              {/* Store name */}

              {/* Store meta details */}

              {/* Product grid skeletons */}
              {/*<Box*/}
              {/*  sx={{*/}
              {/*    mt: 4,*/}
              {/*    display: "grid",*/}
              {/*    gridTemplateColumns: {*/}
              {/*      xs: "repeat(2, 1fr)",*/}
              {/*      sm: "repeat(3, 1fr)",*/}
              {/*      md: "repeat(4, 1fr)",*/}
              {/*    },*/}
              {/*    gap: 2,*/}
              {/*    width: "100%",*/}
              {/*  }}*/}
              {/*>*/}
              {/*  {[...Array(8)].map((_, index) => (*/}
              {/*    <Box key={index}>*/}
              {/*      <Skeleton*/}
              {/*        variant="rectangular"*/}
              {/*        width="100%"*/}
              {/*        height={120}*/}
              {/*        sx={{ borderRadius: 2, mb: 1 }}*/}
              {/*      />*/}
              {/*      <Skeleton variant="text" width="80%" />*/}
              {/*      <Skeleton variant="text" width="60%" />*/}
              {/*    </Box>*/}
              {/*  ))}*/}
              {/*</Box>*/}
            </Box>
            </CustomContainer>
          )}

        </NoSsr>
      </MainLayout>
    </>
  );
};

export default StorePage;
