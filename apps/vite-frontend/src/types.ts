export interface DockerInfo {
  Name: string
  ServerVersion: string
  OperatingSystem: string
  OSType: string
  Architecture: string
  KernelVersion: string
  Driver: string
  DockerRootDir: string
  NCPU: number
  MemTotal: number
  Containers: number
  ContainersRunning: number
  ContainersPaused: number
  ContainersStopped: number
  Images: number
}

export interface DiskUsageRow {
  Type: string
  TotalCount: string
  Active: string
  Size: string
  Reclaimable: string
}

export interface ContainerSummary {
  ID: string
  Names: string
  Image: string
  Command: string
  CreatedAt: string
  RunningFor: string
  Ports: string
  State: string
  Status: string
}

export interface ContainerStats {
  ID: string
  Name: string
  CPUPerc: string
  MemUsage: string
  MemPerc: string
  NetIO: string
  BlockIO: string
  PIDs: string
}

export interface ContainerInspect {
  Id: string
  Name: string
  State: { Status: string; Running: boolean; StartedAt: string }
  Config: { Image: string }
  [key: string]: unknown
}

export type ContainerAction =
  'start' | 'stop' | 'restart' | 'pause' | 'unpause' | 'kill'

export interface ImageSummary {
  ID: string
  Repository: string
  Tag: string
  Digest: string
  CreatedSince: string
  CreatedAt: string
  Size: string
}

export interface VolumeSummary {
  Name: string
  Driver: string
  Scope: string
  Mountpoint: string
  Labels: string
}

export interface NetworkSummary {
  ID: string
  Name: string
  Driver: string
  Scope: string
  CreatedAt: string
}
