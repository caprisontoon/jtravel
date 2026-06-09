import { ExtractionResult, Place } from '@/types/extraction';

export type RootStackParamList = {
  Home: undefined;
  AnalysisLoading: { url: string };
  Itinerary: { result: ExtractionResult };
  PlaceDetail: { place: Place; result: ExtractionResult };
  Reservation: { place: Place };
};
