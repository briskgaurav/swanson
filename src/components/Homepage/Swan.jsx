import React from 'react'
import { useGLTF } from '@react-three/drei'

const MODEL_URL = '/assets/model/swan_compressed_png.glb'

export function Model(props) {
  const { nodes, materials } = useGLTF(MODEL_URL)
  return (
    <group {...props} scale={1} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.swan.geometry}
        material={materials.swan_Baked_BM}
        scale={[1, 1.188, 1]}
      />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
