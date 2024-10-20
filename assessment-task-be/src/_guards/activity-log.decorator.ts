import { SetMetadata } from '@nestjs/common'

export const ActivityLog = (action: string) => SetMetadata('activityLog', action)