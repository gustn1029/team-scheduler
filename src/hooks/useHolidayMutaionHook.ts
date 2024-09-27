import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { formattedHolidayFetch } from "../utils/http";
import { EventsData } from "../types";
import { appFireStore } from "../firebase/config";

const useHolidayStorage = () => {
  const queryClient = useQueryClient();

  // 공휴일 데이터 fetch
  const {
    data: holidays,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["holidays"],
    queryFn: formattedHolidayFetch,
    staleTime: Infinity, // 데이터가 stale 되지 않도록 설정
  });

  // Firestore에 공휴일 추가
  const addHolidayToFirestore = async (holiday: EventsData) => {
    const eventsRef = collection(appFireStore, "events");

    // 중복 체크
    const q = query(
      eventsRef,
      where("title", "==", holiday.title),
      where("startDate", "==", holiday.startDate)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      await addDoc(eventsRef, holiday);
      return true; // 새로운 문서가 추가됨
    }
    return false; // 이미 존재하는 문서
  };

  // 공휴일 저장 mutation
  const { mutateAsync: storeHoliday, isPending } = useMutation({
    mutationFn: addHolidayToFirestore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["holidays"]] });
    },
  });

  // 모든 공휴일 저장 함수
  const storeAllHolidays = async () => {
    if (!holidays) return;

    let addedCount = 0;
    for (const holiday of holidays) {
      const added = await storeHoliday(holiday);
      if (added) addedCount++;
    }

    console.log(`${addedCount} new holidays added to Firestore.`);
  };

  return {
    holidays,
    isLoading: isLoading || isPending,
    isError,
    error,
    storeAllHolidays,
  };
};

export default useHolidayStorage;
