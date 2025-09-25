// src/utils/milkRecordsUtils.ts


// export interface MilkingRecord {
//     date: string; // Format: "DD-MM-YYYY"
//     yield: string;
//     time: "Morning" | "Evening";
//     quality: string;
//   }
  
  import {MilkingRecord} from "@/types/types";

/**
   * Groups records by date (transforms to desired format)
   * @param records Existing milk records in array-of-arrays format
   * @returns Properly grouped records by date
   */
  export const groupRecordsByDate = (records: MilkingRecord[][]): MilkingRecord[][] => {
    const grouped: Record<string, MilkingRecord[]> = {};
  
    // Flatten and regroup
    records.flat().forEach(record => {
      if (!grouped[record.date]) {
        grouped[record.date] = [];
      }
      grouped[record.date].push(record);
    });
  
    // Convert back to array of arrays
    return Object.values(grouped);
  };
  
  /**
   * Adds a new record to the appropriate date group
   * @param existingRecords Current records in array-of-arrays format
   * @param newRecord The new record to add
   * @returns Updated records with proper grouping
   */
  export const addMilkRecord = (
    existingRecords: MilkingRecord[][], 
    newRecord: MilkingRecord
  ): MilkingRecord[][] => {
    const grouped = groupRecordsByDate(existingRecords);
    const dateGroupIndex = grouped.findIndex(group => group[0]?.date === newRecord.date);
    
    if (dateGroupIndex >= 0) {
      // Add to existing date group
      grouped[dateGroupIndex].push(newRecord);
    } else {
      // Create new date group
      grouped.push([newRecord]);
    }
    
    return grouped;
  };
  
  /**
   * Calculates daily total yield
   * @param dailyRecords Records for a single day
   * @returns Total yield as number
   */
  export const calculateDailyTotal = (dailyRecords: MilkingRecord[]): number => {
    return dailyRecords.reduce((sum, r) => sum + Number(r.yield), 0);
  };