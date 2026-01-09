<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import { useUserStore } from '@vben/stores';

interface Props {
  greeting?: string; // 自定义提示语
  showWeather?: boolean; // 是否显示天气
  weatherApiKey?: string; // 和风天气API Key
}

const props = withDefaults(defineProps<Props>(), {
  greeting: '欢迎回来，开始您的工作吧！',
  showWeather: true,
  weatherApiKey: '14107403186e4351932007941cd3561e',
});

const userStore = useUserStore();

// 天气信息
const weather = ref<{
  city: string;
  humidity?: string;
  icon: string;
  iconCode?: string; // 天气图标代码
  temp: string;
  text: string;
  windDir?: string;
} | null>(null);

const weatherLoading = ref(false);

// 天气类型（用于背景装饰）
const weatherType = computed(() => {
  if (!weather.value?.iconCode) return 'clear';

  const code = weather.value.iconCode;
  // 晴天
  if (code === '100' || code === '150') return 'clear';
  // 多云/阴
  if (['101', '102', '103', '104', '151'].includes(code)) return 'cloudy';
  // 雨天
  if (code.startsWith('3')) return 'rainy';
  // 雪天
  if (code.startsWith('4')) return 'snowy';
  // 雾霾
  if (code.startsWith('5')) return 'foggy';

  return 'clear';
});

// 获取当前时间段的问候语
const timeGreeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return '凌晨好';
  if (hour < 9) return '早上好';
  if (hour < 12) return '上午好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  if (hour < 22) return '晚上好';
  return '夜深了';
});

// 获取当前日期
const currentDate = computed(() => {
  const now = new Date();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const weekDay = weekDays[now.getDay()];
  return `${year}-${month}-${day} 星期${weekDay}`;
});

// 获取农历日期
const lunarDate = computed(() => {
  return getLunarDate(new Date());
});

// 农历转换函数
function getLunarDate(date: Date) {
  // 农历数据（1900-2100年）

  const lunarInfo = [
    0x0_4b_d8, 0x0_4a_e0, 0x0_a5_70, 0x0_54_d5, 0x0_d2_60, 0x0_d9_50, 0x1_65_54,
    0x0_56_a0, 0x0_9a_d0, 0x0_55_d2, 0x0_4a_e0, 0x0_a5_b6, 0x0_a4_d0, 0x0_d2_50,
    0x1_d2_55, 0x0_b5_40, 0x0_d6_a0, 0x0_ad_a2, 0x0_95_b0, 0x1_49_77, 0x0_49_70,
    0x0_a4_b0, 0x0_b4_b5, 0x0_6a_50, 0x0_6d_40, 0x1_ab_54, 0x0_2b_60, 0x0_95_70,
    0x0_52_f2, 0x0_49_70, 0x0_65_66, 0x0_d4_a0, 0x0_ea_50, 0x1_6a_95, 0x0_5a_d0,
    0x0_2b_60, 0x1_86_e3, 0x0_92_e0, 0x1_c8_d7, 0x0_c9_50, 0x0_d4_a0, 0x1_d8_a6,
    0x0_b5_50, 0x0_56_a0, 0x1_a5_b4, 0x0_25_d0, 0x0_92_d0, 0x0_d2_b2, 0x0_a9_50,
    0x0_b5_57, 0x0_6c_a0, 0x0_b5_50, 0x1_53_55, 0x0_4d_a0, 0x0_a5_b0, 0x1_45_73,
    0x0_52_b0, 0x0_a9_a8, 0x0_e9_50, 0x0_6a_a0, 0x0_ae_a6, 0x0_ab_50, 0x0_4b_60,
    0x0_aa_e4, 0x0_a5_70, 0x0_52_60, 0x0_f2_63, 0x0_d9_50, 0x0_5b_57, 0x0_56_a0,
    0x0_96_d0, 0x0_4d_d5, 0x0_4a_d0, 0x0_a4_d0, 0x0_d4_d4, 0x0_d2_50, 0x0_d5_58,
    0x0_b5_40, 0x0_b6_a0, 0x1_95_a6, 0x0_95_b0, 0x0_49_b0, 0x0_a9_74, 0x0_a4_b0,
    0x0_b2_7a, 0x0_6a_50, 0x0_6d_40, 0x0_af_46, 0x0_ab_60, 0x0_95_70, 0x0_4a_f5,
    0x0_49_70, 0x0_64_b0, 0x0_74_a3, 0x0_ea_50, 0x0_6b_58, 0x0_5a_c0, 0x0_ab_60,
    0x0_96_d5, 0x0_92_e0,
  ];

  const solarMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const zhi = [
    '子',
    '丑',
    '寅',
    '卯',
    '辰',
    '巳',
    '午',
    '未',
    '申',
    '酉',
    '戌',
    '亥',
  ];
  const animals = [
    '鼠',
    '牛',
    '虎',
    '兔',
    '龙',
    '蛇',
    '马',
    '羊',
    '猴',
    '鸡',
    '狗',
    '猪',
  ];
  const lunarMonths = [
    '正',
    '二',
    '三',
    '四',
    '五',
    '六',
    '七',
    '八',
    '九',
    '十',
    '冬',
    '腊',
  ];
  const lunarDays = [
    '初一',
    '初二',
    '初三',
    '初四',
    '初五',
    '初六',
    '初七',
    '初八',
    '初九',
    '初十',
    '十一',
    '十二',
    '十三',
    '十四',
    '十五',
    '十六',
    '十七',
    '十八',
    '十九',
    '二十',
    '廿一',
    '廿二',
    '廿三',
    '廿四',
    '廿五',
    '廿六',
    '廿七',
    '廿八',
    '廿九',
    '三十',
  ];

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 简化版：只计算基本农历
  if (year < 1900 || year > 2099) {
    return '农历'; // 超出范围
  }

  // 计算从1900年到当前年的天数
  let offset = 0;
  for (let i = 1900; i < year; i++) {
    const isLeapYear = (i % 4 === 0 && i % 100 !== 0) || i % 400 === 0;
    offset += isLeapYear ? 366 : 365;
  }

  // 加上当前年到当前月的天数
  for (let i = 0; i < month - 1; i++) {
    offset += solarMonths[i] || 0;
  }
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  if (month > 2 && isLeapYear) offset += 1;
  offset += day;

  // 1900年1月31日是农历1900年正月初一
  offset -= 30;

  // 计算农历年月日
  let lunarYear = 1900;
  let lunarMonth = 1;
  let lunarDay = 0;
  let daysInYear = 0;

  // 计算到哪一年
  for (let i = 0; i < 200 && offset > 0; i++) {
    const yearIndex = lunarYear - 1900;
    if (yearIndex >= 0 && yearIndex < lunarInfo.length) {
      const lunarYearData = lunarInfo[yearIndex];
      if (lunarYearData !== undefined) {
        daysInYear = getDaysInLunarYear(lunarYearData);
        if (offset >= daysInYear) {
          offset -= daysInYear;
          lunarYear++;
        } else {
          break;
        }
      }
    } else {
      break;
    }
  }

  // 计算到哪一月
  const yearIndex = lunarYear - 1900;
  if (yearIndex >= 0 && yearIndex < lunarInfo.length) {
    const lunarYearData = lunarInfo[yearIndex];
    if (lunarYearData !== undefined) {
      const leapMonth = getLeapMonth(lunarYearData);
      let isLeap = false;

      for (let i = 1; i <= 12 && offset > 0; i++) {
        let daysInMonth = 0;

        if (leapMonth > 0 && i === leapMonth + 1 && !isLeap) {
          i--;
          isLeap = true;
          daysInMonth = getLeapDays(lunarYearData);
        } else {
          daysInMonth = getLunarMonthDays(lunarYearData, i);
        }

        if (offset >= daysInMonth) {
          offset -= daysInMonth;
          if (isLeap && i === leapMonth) {
            isLeap = false;
          }
          if (!isLeap) lunarMonth = i + 1;
        } else {
          lunarDay = offset;
          break;
        }
      }
    }
  }

  // 生成天干地支年
  const ganIndex = (lunarYear - 4) % 10;
  const zhiIndex = (lunarYear - 4) % 12;
  const yearText = `${gan[ganIndex]}${zhi[zhiIndex]}${animals[zhiIndex]}年`;

  // 月份
  const monthText =
    lunarMonth > 12
      ? `闰${lunarMonths[(lunarMonth - 13) % 12]}月`
      : `${lunarMonths[(lunarMonth - 1) % 12]}月`;

  // 日期
  const dayText = lunarDays[lunarDay] || lunarDays[0];

  return `${yearText} ${monthText}${dayText}`;
}

// 获取农历年的总天数
function getDaysInLunarYear(lunarYearInfo: number): number {
  let days = 0;
  for (let i = 0x80_00; i > 0x8; i >>= 1) {
    days += lunarYearInfo & i ? 30 : 29;
  }
  return days + getLeapDays(lunarYearInfo);
}

// 获取农历年的闰月天数
function getLeapDays(lunarYearInfo: number): number {
  if (getLeapMonth(lunarYearInfo)) {
    return lunarYearInfo & 0x1_00_00 ? 30 : 29;
  }
  return 0;
}

// 获取农历年的闰月月份（0表示无闰月）
function getLeapMonth(lunarYearInfo: number): number {
  return lunarYearInfo & 0xf;
}

// 获取农历月的天数
function getLunarMonthDays(lunarYearInfo: number, month: number): number {
  return lunarYearInfo & (0x1_00_00 >> month) ? 30 : 29;
}

// 获取天气图标
function getWeatherIcon(iconCode: string) {
  // 和风天气图标代码映射到 iconify
  const iconMap: Record<string, string> = {
    '100': 'wi:day-sunny', // 晴
    '101': 'wi:day-cloudy', // 多云
    '102': 'wi:cloudy', // 少云
    '103': 'wi:cloud', // 晴间多云
    '104': 'wi:cloudy', // 阴
    '150': 'wi:night-clear', // 晴（夜）
    '151': 'wi:night-cloudy', // 多云（夜）
    '300': 'wi:showers', // 阵雨
    '301': 'wi:rain', // 强阵雨
    '302': 'wi:thunderstorm', // 雷阵雨
    '303': 'wi:storm-showers', // 强雷阵雨
    '304': 'wi:hail', // 雷阵雨伴有冰雹
    '305': 'wi:sprinkle', // 小雨
    '306': 'wi:rain', // 中雨
    '307': 'wi:rain-wind', // 大雨
    '308': 'wi:rain-wind', // 极端降雨
    '309': 'wi:showers', // 毛毛雨/细雨
    '310': 'wi:storm-showers', // 暴雨
    '311': 'wi:storm-showers', // 大暴雨
    '312': 'wi:hurricane', // 特大暴雨
    '313': 'wi:sleet', // 冻雨
    '314': 'wi:sprinkle', // 小到中雨
    '315': 'wi:rain', // 中到大雨
    '316': 'wi:rain-wind', // 大到暴雨
    '317': 'wi:storm-showers', // 暴雨到大暴雨
    '318': 'wi:hurricane', // 大暴雨到特大暴雨
    '399': 'wi:rain', // 雨
    '400': 'wi:snow', // 小雪
    '401': 'wi:snow', // 中雪
    '402': 'wi:snow-wind', // 大雪
    '403': 'wi:snow-wind', // 暴雪
    '404': 'wi:sleet', // 雨夹雪
    '405': 'wi:rain-mix', // 雨雪天气
    '406': 'wi:sleet', // 阵雨夹雪
    '407': 'wi:snow', // 阵雪
    '499': 'wi:snow', // 雪
    '500': 'wi:fog', // 薄雾
    '501': 'wi:fog', // 雾
    '502': 'wi:smog', // 霾
    '503': 'wi:dust', // 扬沙
    '504': 'wi:sandstorm', // 浮尘
    '507': 'wi:dust', // 沙尘暴
    '508': 'wi:sandstorm', // 强沙尘暴
    '509': 'wi:fog', // 浓雾
    '510': 'wi:fog', // 强浓雾
    '511': 'wi:fog', // 中度霾
    '512': 'wi:smog', // 重度霾
    '513': 'wi:smog', // 严重霾
    '514': 'wi:fog', // 大雾
    '515': 'wi:fog', // 特强浓雾
  };

  return iconMap[iconCode] || 'wi:day-sunny';
}

// 获取浏览器地理位置
async function getBrowserLocation(): Promise<null | {
  latitude: number;
  longitude: number;
}> {
  if (!navigator.geolocation) {
    console.warn('浏览器不支持地理定位');
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        });
      },
      (error) => {
        console.warn('获取地理位置失败:', error.message);
        resolve(null);
      },
      { timeout: 5000, enableHighAccuracy: false },
    );
  });
}

// 去除城市名称后缀（市、自治州、地区、盟等）
function removeCitySuffix(cityName: string): string {
  if (!cityName) {
    return cityName;
  }

  // 城市后缀列表（按优先级排序，先匹配长的后缀）
  const suffixes = ['特别行政区', '自治州', '地区', '市', '盟', '县'];

  let result = cityName;
  // 从长到短匹配后缀，确保先匹配"特别行政区"再匹配"市"
  for (const suffix of suffixes) {
    if (result.endsWith(suffix)) {
      result = result.slice(0, -suffix.length);
      break; // 只去掉一个后缀
    }
  }

  return result;
}

// 使用和风天气API获取城市和位置ID
interface LocationInfo {
  cityName: string;
  locationId: string;
}

async function getLocationByQWeather(
  longitude?: number,
  latitude?: number,
): Promise<LocationInfo | null> {
  if (!props.weatherApiKey) {
    return null;
  }

  try {
    // 如果有经纬度，使用经纬度查询；否则使用IP定位
    const locationQuery =
      longitude && latitude ? `${longitude},${latitude}` : 'auto_ip';

    // 使用正确的API域名：geoapi.qweather.com（免费版）
    const response = await fetch(
      `https://geoapi.qweather.com/v2/city/lookup?location=${encodeURIComponent(locationQuery)}&key=${props.weatherApiKey}`,
    );
    const data = await response.json();

    if (data.code === '200' && data.location?.length > 0) {
      const location = data.location[0];
      return {
        cityName: removeCitySuffix(location.name),
        locationId: location.id,
      };
    }

    console.warn('和风天气城市查询失败:', data);
  } catch (error) {
    console.error('和风天气城市查询异常:', error);
  }

  return null;
}

// 获取天气信息
async function fetchWeather() {
  if (!props.showWeather) {
    return;
  }

  weatherLoading.value = true;

  try {
    // 如果未配置API Key，使用默认数据
    if (!props.weatherApiKey) {
      weather.value = {
        city: '深圳',
        temp: '22',
        text: '晴',
        icon: 'wi:day-sunny',
        iconCode: '100',
        humidity: '65%',
        windDir: '东南风',
      };
      return;
    }

    // 步骤1: 获取浏览器地理位置（可选）
    const browserLocation = await getBrowserLocation();

    // 步骤2: 使用和风天气API获取城市和位置ID
    const locationInfo = await getLocationByQWeather(
      browserLocation?.longitude,
      browserLocation?.latitude,
    );

    // 如果获取位置失败，使用默认城市
    if (!locationInfo) {
      console.warn('无法获取城市信息，使用默认城市');
      weather.value = {
        city: '深圳',
        temp: '22',
        text: '晴',
        icon: 'wi:day-sunny',
        iconCode: '100',
        humidity: '65%',
        windDir: '东南风',
      };
      return;
    }

    // 步骤3: 使用位置ID获取实时天气
    const weatherResponse = await fetch(
      `https://devapi.qweather.com/v7/weather/now?location=${locationInfo.locationId}&key=${props.weatherApiKey}`,
    );
    const weatherData = await weatherResponse.json();

    if (weatherData.code === '200' && weatherData.now) {
      const now = weatherData.now;
      weather.value = {
        city: locationInfo.cityName,
        temp: now.temp,
        text: now.text,
        icon: getWeatherIcon(now.icon),
        iconCode: now.icon,
        humidity: `${now.humidity}%`,
        windDir: now.windDir,
      };
    } else {
      throw new Error(`获取天气数据失败: ${weatherData.code}`);
    }
  } catch (error) {
    console.error('获取天气信息失败:', error);
    // 失败时使用默认数据
    weather.value = {
      city: '深圳',
      temp: '22',
      text: '晴',
      icon: 'wi:day-sunny',
      iconCode: '100',
      humidity: '65%',
      windDir: '东南风',
    };
  } finally {
    weatherLoading.value = false;
  }
}

// 组件挂载时获取天气
onMounted(() => {
  if (props.showWeather) {
    fetchWeather();
  }
});
</script>

<template>
  <div class="workbench-welcome relative overflow-hidden rounded-lg">
    <!-- 内容区 -->
    <div class="welcome-content relative z-10 px-8 py-6">
      <div class="flex items-center justify-between">
        <!-- 左侧：用户问候 -->
        <div class="flex-1">
          <h2 class="mb-2 text-2xl font-bold text-white">
            {{ timeGreeting }}，{{
              userStore.userInfo?.realName || userStore.userInfo?.username
            }}
          </h2>
          <p class="mb-4 text-base text-white/90">
            {{ greeting }}
          </p>
          <div class="flex items-center gap-4 text-sm text-white/80">
            <span class="flex items-center gap-1">
              <iconify-icon icon="carbon:calendar" class="text-lg" />
              {{ currentDate }}
            </span>
            <span class="flex items-center gap-1">
              <iconify-icon icon="carbon:events" class="text-lg" />
              {{ lunarDate }}
            </span>
          </div>
        </div>

        <!-- 右侧：天气信息 -->
        <div
          v-if="showWeather && weather"
          class="weather-info relative flex items-center gap-4 overflow-hidden"
        >
          <!-- 天气装饰背景 - 根据天气类型显示 -->
          <div class="weather-decoration absolute inset-0">
            <!-- 晴天：太阳 -->
            <template v-if="weatherType === 'clear'">
              <div class="sun"></div>
            </template>

            <!-- 多云：云朵 -->
            <template v-else-if="weatherType === 'cloudy'">
              <div class="small-cloud cloud-s1"></div>
              <div class="small-cloud cloud-s2"></div>
            </template>

            <!-- 雨天：雨滴效果 -->
            <template v-else-if="weatherType === 'rainy'">
              <div class="small-rain rain-s1"></div>
              <div class="small-rain rain-s2"></div>
              <div class="small-rain rain-s3"></div>
            </template>

            <!-- 雪天：雪花效果 -->
            <template v-else-if="weatherType === 'snowy'">
              <div class="small-snow snow-s1">❄</div>
              <div class="small-snow snow-s2">❄</div>
              <div class="small-snow snow-s3">❄</div>
            </template>

            <!-- 雾霾：朦胧效果 -->
            <template v-else-if="weatherType === 'foggy'">
              <div class="small-fog fog-s1"></div>
            </template>
          </div>

          <div class="relative z-10 flex flex-col items-end">
            <div class="mb-1 flex items-center gap-2">
              <iconify-icon :icon="weather.icon" class="text-5xl text-white" />
              <div class="text-4xl font-bold text-white">
                {{ weather.temp }}°
              </div>
            </div>
            <div class="text-sm text-white/90">{{ weather.text }}</div>
          </div>
          <div class="weather-details relative z-10 text-sm text-white/80">
            <div class="mb-1">{{ weather.city }}</div>
            <div v-if="weather.humidity">湿度 {{ weather.humidity }}</div>
            <div v-if="weather.windDir">{{ weather.windDir }}</div>
          </div>
        </div>

        <!-- 天气加载中 -->
        <div
          v-else-if="showWeather && weatherLoading"
          class="flex items-center gap-2 text-white/80"
        >
          <iconify-icon icon="line-md:loading-twotone-loop" class="text-2xl" />
          <span class="text-sm">加载天气中...</span>
        </div>

        <!-- 装饰图标 -->
        <div v-else class="flex items-center">
          <iconify-icon
            icon="carbon:sun"
            class="animate-spin-slow text-6xl text-white/20"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes sun-pulse {
  0%,
  100% {
    opacity: 0.8;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes sun-rotate {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }

  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes float-small {
  0%,
  100% {
    transform: translateY(0) translateX(0);
  }

  50% {
    transform: translateY(-10px) translateX(5px);
  }
}

@keyframes rain-fall-small {
  0% {
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateY(100px);
  }
}

@keyframes snow-fall-small {
  0% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }

  100% {
    opacity: 0.3;
    transform: translateY(100px) rotate(180deg);
  }
}

@keyframes fog-move-small {
  0%,
  100% {
    opacity: 0.4;
    transform: translateX(-5%);
  }

  50% {
    opacity: 0.7;
    transform: translateX(5%);
  }
}

/* 响应式 */
@media (width <= 768px) {
  .welcome-content {
    padding: 16px;
  }

  .workbench-welcome h2 {
    font-size: 18px;
  }

  .workbench-welcome p {
    font-size: 14px;
  }

  .weather-info {
    display: none;
  }
}

/* 固定背景渐变 - 蓝色系（与原型一致） */
.workbench-welcome {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 10%),
    0 2px 4px -1px rgb(0 0 0 / 6%);
}

/* 天气框装饰 */
.weather-decoration {
  z-index: 0;
  pointer-events: none;
}

/* 太阳效果 */
.sun {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 60px;
  height: 60px;
  background: radial-gradient(
    circle,
    rgb(255 255 255 / 40%) 0%,
    transparent 70%
  );
  border-radius: 50%;
  animation: sun-pulse 3s ease-in-out infinite;
}

.sun::before {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  content: '';
  background: rgb(255 255 255 / 30%);
  border-radius: 50%;
  box-shadow: 0 0 20px rgb(255 255 255 / 50%);
  transform: translate(-50%, -50%);
  animation: sun-rotate 8s linear infinite;
}

/* 小云朵 */
.small-cloud {
  position: absolute;
  background: rgb(255 255 255 / 15%);
  border-radius: 50px;
  animation: float-small 10s ease-in-out infinite;
}

.cloud-s1 {
  top: 15px;
  right: 20px;
  width: 50px;
  height: 20px;
  animation-delay: 0s;
}

.cloud-s1::before,
.cloud-s1::after {
  position: absolute;
  content: '';
  background: rgb(255 255 255 / 15%);
  border-radius: 50%;
}

.cloud-s1::before {
  top: -12px;
  left: 10px;
  width: 25px;
  height: 25px;
}

.cloud-s1::after {
  top: -8px;
  right: 8px;
  width: 20px;
  height: 20px;
}

.cloud-s2 {
  right: 40px;
  bottom: 20px;
  width: 40px;
  height: 16px;
  animation-delay: 5s;
}

.cloud-s2::before,
.cloud-s2::after {
  position: absolute;
  content: '';
  background: rgb(255 255 255 / 15%);
  border-radius: 50%;
}

.cloud-s2::before {
  top: -10px;
  left: 8px;
  width: 20px;
  height: 20px;
}

.cloud-s2::after {
  top: -6px;
  right: 6px;
  width: 16px;
  height: 16px;
}

/* 小雨滴 */
.small-rain {
  position: absolute;
  width: 1.5px;
  height: 15px;
  background: linear-gradient(to bottom, transparent, rgb(255 255 255 / 40%));
  animation: rain-fall-small 1.5s linear infinite;
}

.rain-s1 {
  top: 0;
  right: 30%;
  animation-delay: 0s;
}

.rain-s2 {
  top: 0;
  right: 50%;
  animation-delay: 0.5s;
}

.rain-s3 {
  top: 0;
  right: 70%;
  animation-delay: 1s;
}

/* 小雪花 */
.small-snow {
  position: absolute;
  font-size: 16px;
  color: rgb(255 255 255 / 60%);
  animation: snow-fall-small 5s linear infinite;
}

.snow-s1 {
  top: 0;
  right: 25%;
  animation-delay: 0s;
}

.snow-s2 {
  top: 0;
  right: 50%;
  font-size: 14px;
  animation-delay: 1.5s;
}

.snow-s3 {
  top: 0;
  right: 75%;
  font-size: 18px;
  animation-delay: 3s;
}

/* 小雾气 */
.small-fog {
  position: absolute;
  width: 100%;
  height: 50%;
  background: linear-gradient(
    to bottom,
    transparent,
    rgb(255 255 255 / 10%),
    transparent
  );
  animation: fog-move-small 8s ease-in-out infinite;
}

.fog-s1 {
  top: 25%;
}

.animate-spin-slow {
  animation: spin-slow 20s linear infinite;
}

/* 天气信息样式 */
.weather-info {
  padding: 16px 24px;
  background: rgb(255 255 255 / 10%);
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.weather-details > div {
  line-height: 1.6;
}

/* 慢速旋转动画 */
</style>
