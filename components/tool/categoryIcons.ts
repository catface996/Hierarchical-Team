/**
 * Tool Category Icon Utilities
 * 
 * Map category names to icons (similar to resource type icons)
 */

import {
  Database,
  Server,
  Shield,
  Activity,
  Cpu,
  Box,
  Cloud,
  Network,
  Globe,
  Layers,
  Search,
  FileText,
  Bug,
  Bot,
  Wrench,
  FolderOpen,
  Code,
  Settings,
  BarChart3,
  type LucideIcon
} from 'lucide-react';
import type { IconType } from 'react-icons';
import {
  SiMysql,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiApachekafka,
  SiElasticsearch,
  SiDocker,
  SiKubernetes,
  SiPrometheus,
  SiGrafana,
  SiAmazonwebservices,
  SiGooglecloud,
  SiTerraform,
  SiAnsible,
  SiPython,
  SiGnubash,
  SiLinux,
} from 'react-icons/si';
import {
  FaDatabase,
  FaNetworkWired,
  FaServer,
  FaCloud,
  FaShieldAlt,
  FaChartBar,
  FaCode,
  FaCog,
  FaSearch,
  FaFileAlt,
  FaBug,
  FaRobot,
  FaTools,
  FaFolder,
} from 'react-icons/fa';

// Combined icon type
export type CategoryIcon = LucideIcon | IconType;

/**
 * Brand icon mapping - specific technology icons
 */
const BRAND_ICONS: Record<string, IconType> = {
  // Databases
  mysql: SiMysql,
  postgres: SiPostgresql,
  postgresql: SiPostgresql,
  mongodb: SiMongodb,
  mongo: SiMongodb,
  redis: SiRedis,
  
  // Message Queues
  kafka: SiApachekafka,
  
  // Search
  elasticsearch: SiElasticsearch,
  elastic: SiElasticsearch,
  
  // Container & Orchestration
  docker: SiDocker,
  kubernetes: SiKubernetes,
  k8s: SiKubernetes,
  
  // Cloud
  aws: SiAmazonwebservices,
  gcp: SiGooglecloud,
  
  // Monitoring
  prometheus: SiPrometheus,
  grafana: SiGrafana,
  
  // DevOps
  terraform: SiTerraform,
  ansible: SiAnsible,
  
  // Languages/Scripts
  python: SiPython,
  bash: SiGnubash,
  shell: SiGnubash,
  linux: SiLinux,
};

/**
 * Generic icon mapping (fallback)
 */
const GENERIC_ICONS: Record<string, CategoryIcon> = {
  // English
  database: FaDatabase,
  db: FaDatabase,
  network: FaNetworkWired,
  server: FaServer,
  cloud: FaCloud,
  security: FaShieldAlt,
  monitoring: FaChartBar,
  analytics: FaChartBar,
  metric: FaChartBar,
  code: FaCode,
  development: FaCode,
  dev: FaCode,
  config: FaCog,
  configuration: FaCog,
  setting: FaCog,
  search: FaSearch,
  query: FaSearch,
  document: FaFileAlt,
  file: FaFileAlt,
  log: FaFileAlt,
  debug: FaBug,
  diagnostic: FaBug,
  troubleshoot: FaBug,
  ai: FaRobot,
  automation: FaRobot,
  llm: FaRobot,
  tool: FaTools,
  utility: FaTools,
  infra: Cpu,
  infrastructure: Cpu,
  api: Globe,
  http: Globe,
  web: Globe,
  middleware: Layers,
  
  // Chinese
  '数据库': FaDatabase,
  '网络': FaNetworkWired,
  '服务器': FaServer,
  '云': FaCloud,
  '安全': FaShieldAlt,
  '监控': FaChartBar,
  '分析': FaChartBar,
  '指标': FaChartBar,
  '代码': FaCode,
  '开发': FaCode,
  '配置': FaCog,
  '搜索': FaSearch,
  '查询': FaSearch,
  '文档': FaFileAlt,
  '文件': FaFileAlt,
  '日志': FaFileAlt,
  '调试': FaBug,
  '诊断': FaBug,
  '排障': FaBug,
  '智能': FaRobot,
  '自动化': FaRobot,
  '工具': FaTools,
  '基础设施': Cpu,
};

/**
 * Default icon
 */
const DEFAULT_ICON: IconType = FaFolder;

/**
 * Get icon component by category name
 * Returns brand-specific icons when possible, falls back to generic icons
 */
export function getCategoryIcon(categoryName: string | null | undefined): CategoryIcon {
  if (!categoryName) return DEFAULT_ICON;
  
  const nameLower = categoryName.toLowerCase();
  
  // Search for brand icons first
  for (const [key, icon] of Object.entries(BRAND_ICONS)) {
    if (nameLower.includes(key)) {
      return icon;
    }
  }
  
  // Fall back to generic icons
  for (const [key, icon] of Object.entries(GENERIC_ICONS)) {
    if (nameLower.includes(key) || key.includes(nameLower)) {
      return icon;
    }
  }
  
  return DEFAULT_ICON;
}
