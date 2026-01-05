import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import React, { useState, useRef, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DateTimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDateTime: (date: Date) => void;
  initialDate?: Date;
}

export default function DateTimePickerModal({ visible, onClose, onSelectDateTime, initialDate = new Date() }: DateTimePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedHour, setSelectedHour] = useState(initialDate.getHours());
  const [selectedMinute, setSelectedMinute] = useState(initialDate.getMinutes());
  const [sliderValue, setSliderValue] = useState(0.5);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAM, setIsAM] = useState(initialDate.getHours() < 12);
  const scrollViewRef = useRef<ScrollView>(null);

  // Generate dates for the current month
  const generateMonthDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(year, month, day));
    }
    return dates;
  };

  const dates = generateMonthDates();
  const todayIndex = dates.findIndex(date => 
    date.toDateString() === selectedDate.toDateString()
  );
  const [selectedDateIndex, setSelectedDateIndex] = useState(todayIndex >= 0 ? todayIndex : 0);

  useEffect(() => {
    if (scrollViewRef.current && selectedDateIndex >= 0) {
      const cardWidth = 72; // 60 + 12 margin
      const scrollPosition = selectedDateIndex * cardWidth - 120; // Center the card
      scrollViewRef.current.scrollTo({ x: Math.max(0, scrollPosition), animated: true });
    }
  }, [selectedDateIndex]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatCurrentDateTime = () => {
    const date = selectedDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    const displayHour = selectedHour === 0 ? 12 : selectedHour > 12 ? selectedHour - 12 : selectedHour;
    const time = `${displayHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    return { date, time };
  };

  const formatMonthYear = () => {
    return currentMonth.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
    
    // Find if the same date exists in the new month
    const newDates = [];
    const year = newMonth.getFullYear();
    const month = newMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      newDates.push(new Date(year, month, day));
    }
    
    const matchingIndex = newDates.findIndex(date => 
      date.getDate() === selectedDate.getDate()
    );
    
    if (matchingIndex >= 0) {
      setSelectedDateIndex(matchingIndex);
      setSelectedDate(newDates[matchingIndex]);
    } else {
      setSelectedDateIndex(-1);
    }
  };

  const getTimePeriod = (hour: number) => {
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
  };

  const updateTimeFromSlider = (value: number) => {
    setSliderValue(value);
    const totalMinutes = Math.round(value * 1440); // 24 hours * 60 minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    setSelectedHour(hours);
    setSelectedMinute(minutes);
  };

  const handleSave = () => {
    const newDate = new Date(selectedDate);
    newDate.setHours(selectedHour, selectedMinute, 0, 0);
    onSelectDateTime(newDate);
    onClose();
  };

  const setCurrentTime = () => {
    const now = new Date();
    setSelectedHour(now.getHours());
    setSelectedMinute(now.getMinutes());
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    setSliderValue(totalMinutes / 1440);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.container}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandle}>
            <View style={styles.handle} />
          </View>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Select Date</Text>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.currentSelection}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' }}>
            <Text style={styles.currentDate}>
              {formatCurrentDateTime().date}, <Text style={styles.currentTime}>{formatCurrentDateTime().time}</Text>
            </Text>
            <Text style={[styles.ampm, { marginLeft: 8 }]}>{selectedHour < 12 ? 'AM' : 'PM'}</Text>
          </View>
          <Text style={styles.currentDay}>{getTimePeriod(selectedHour)}</Text>
        </View>

        {/* Date Ribbon */}
        <View style={styles.dateSection}>
          <View style={styles.dateSectionHeader}>
            <Text style={styles.sectionTitle}>DAY</Text>
            <View style={styles.monthNavigation}>
              <TouchableOpacity onPress={() => navigateMonth('prev')}>
                <Ionicons name="chevron-back" size={20} color="#9ca3af" />
              </TouchableOpacity>
              <Text style={styles.monthText}>{formatMonthYear()}</Text>
              <TouchableOpacity onPress={() => navigateMonth('next')}>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView 
            ref={scrollViewRef}
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.dateRibbon}
          >
            {dates.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateCard,
                  index === selectedDateIndex && styles.selectedDateCard
                ]}
                onPress={() => {
                  setSelectedDate(date);
                  setSelectedDateIndex(index);
                }}
              >
                <Text style={[
                  styles.dayText,
                  index === selectedDateIndex && styles.selectedDayText
                ]}>
                  {formatDate(date)}
                </Text>
                <Text style={[
                  styles.dateNumber,
                  index === selectedDateIndex && styles.selectedDateNumber
                ]}>
                  {date.getDate()}
                </Text>
                {index === selectedDateIndex && <View style={styles.selectedDot} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Section */}
        <View style={styles.timeSection}>
          <View style={styles.timeSectionHeader}>
            <View style={styles.timeHeaderLeft}>
              <Ionicons name="time" size={18} color="#9ca3af" />
              <Text style={styles.sectionTitle}>TIME</Text>
            </View>
          </View>

          {/* Digital Time Display */}
          <View style={styles.digitalTimeContainer}>
            <View style={styles.timeInputGroup}>
              <Text style={styles.timeDisplay}>{(selectedHour === 0 ? 12 : selectedHour > 12 ? selectedHour - 12 : selectedHour).toString().padStart(2, '0')}</Text>
              <Text style={styles.timeLabel}>HOUR</Text>
            </View>
            <Text style={styles.timeSeparator}>:</Text>
            <View style={styles.timeInputGroup}>
              <Text style={styles.timeDisplay}>{selectedMinute.toString().padStart(2, '0')}</Text>
              <Text style={styles.timeLabel}>MIN</Text>
            </View>
            <View style={styles.ampmContainer}>
              <Text style={styles.ampmText}>{selectedHour < 12 ? 'AM' : 'PM'}</Text>
            </View>
          </View>

          {/* Time Slider */}
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={sliderValue}
              onValueChange={updateTimeFromSlider}
              minimumTrackTintColor="#EA2831"
              maximumTrackTintColor="#e5e7eb"
              thumbStyle={styles.sliderThumbStyle}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>MORNING</Text>
              <Text style={styles.sliderLabel}>AFTERNOON</Text>
              <Text style={styles.sliderLabel}>EVENING</Text>
              <Text style={styles.sliderLabel}>NIGHT</Text>
            </View>
          </View>
        </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.selectButton} onPress={handleSave}>
            <Text style={styles.selectButtonText}>Select</Text>
          </TouchableOpacity>
        </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scrollContent: {
    flex: 1,
  },
  container: {
    backgroundColor: '#f8f6f6',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '80%',
    flexDirection: 'column',
  },
  dragHandle: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 48,
    height: 6,
    backgroundColor: '#d1d5db',
    borderRadius: 3,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  currentSelection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  currentDate: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
  },
  currentTime: {
    color: '#EA2831',
  },
  ampm: {
    fontSize: 20,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  currentDay: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 8,
  },
  dateSection: {
    marginBottom: 32,
  },
  dateSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9ca3af',
    letterSpacing: 1,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  dateRibbon: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  dateCard: {
    width: 60,
    height: 84,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedDateCard: {
    backgroundColor: '#EA2831',
    borderColor: '#EA2831',
    transform: [{ scale: 1.05 }, { translateY: -2 }],
    shadowColor: '#EA2831',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 4,
  },
  selectedDayText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 'bold',
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  selectedDateNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
  },
  selectedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
    marginTop: 4,
  },
  timeSection: {
    paddingHorizontal: 16,
  },
  timeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  timeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  digitalTimeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 24,
  },
  timeInputGroup: {
    alignItems: 'center',
  },
  timeDisplay: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    width: 80,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    paddingBottom: 4,
  },
  activeTimeDisplay: {
    borderBottomColor: '#EA2831',
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 1,
    marginTop: 4,
  },
  timeSeparator: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#d1d5db',
    paddingBottom: 24,
  },
  ampmContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    marginLeft: 8,
  },
  ampmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  sliderContainer: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumbStyle: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#EA2831',
    width: 24,
    height: 24,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  sliderLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9ca3af',
    letterSpacing: 1,
  },
  ampmToggle: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    padding: 4,
  },
  ampmButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeAmpmButton: {
    backgroundColor: 'white',
  },
  ampmButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  activeAmpmButtonText: {
    color: '#1f2937',
  },

  footer: {
    padding: 24,
  },
  selectButton: {
    backgroundColor: '#EA2831',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});