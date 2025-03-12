import { SetMetadata } from "@nestjs/common"

const PARAMS_INFO_KEY = 'param_info_key'

export const CommonParams = (
	obj: Partial<any>,
) => SetMetadata(PARAMS_INFO_KEY, obj)