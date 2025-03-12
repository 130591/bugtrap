import 'reflect-metadata'
import { Injectable, SetMetadata } from '@nestjs/common'
import { applyDecorators } from '@nestjs/common'

export const Listener = (): ClassDecorator => {
  return applyDecorators(
    Injectable(),
    SetMetadata('listener', true)
  )
}
