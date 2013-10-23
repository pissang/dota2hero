$cd "H:\dota2resources\heros\shadow_demon\smd"
$modelname "heroes/shadow_demon/shadow_demon.mdl"
$model "default" "shadow_demon_model.dmx.smd"

$lod 1
 {
  replacemodel "shadow_demon_model.dmx" "lod1_shadow_demon_model.dmx"
}
$poseparameter turn -1.00 1.00
$cdmaterials ""
$hboxset "default"
$hbox 0 "spine1" -12.345  -27.421  -25.850  28.748  27.421  24.594
$hbox 0 "spine2" -11.868  0.446  -21.791  5.029  21.665  33.649
$hbox 0 "spine3" -3.383  -36.772  -23.642  57.787  36.772  51.600
$hbox 0 "bicep_R" -58.938  -11.556  -18.504  2.141  38.276  13.863
$hbox 0 "elbow_R" -26.164  -12.717  -21.858  9.944  12.318  12.168
$hbox 0 "r_pinky3_0" 5.960  -1.717  -4.047  7.574  2.516  -3.361
$hbox 0 "r_pinky3_1" 2.165  -3.362  -3.517  17.541  2.660  4.260
$hbox 0 "jaw1_0" 1.427  -7.817  0.309  11.061  7.817  12.437
$hbox 0 "bicep_L" -2.141  -38.276  -13.864  58.938  11.556  18.504
$hbox 0 "elbow_L" -9.944  -12.318  -12.168  26.164  12.717  21.858
$hbox 0 "l_pinky2_0" 6.639  -3.065  -4.576  8.745  0.952  -3.926
$hbox 0 "l_pinky2_1" 2.626  -3.213  -3.943  17.399  3.432  4.209
$hbox 0 "thigh_R" -35.247  -25.507  -29.387  18.872  10.546  22.315
$hbox 0 "knee_R" -22.491  -11.194  -9.397  8.587  9.832  11.711
$hbox 0 "root" -22.476  -24.591  -13.688  22.453  24.591  22.811
$hbox 0 "thigh_L" -18.872  -10.546  -22.315  35.247  25.507  29.387
$hbox 0 "knee_L" -8.587  -9.829  -11.711  22.491  11.194  9.397
$hboxset "feet"
$hbox 0 "ankle_L" -18.976  -23.790  -19.212  53.385  19.957  26.939
$hbox 0 "ankle_R" -52.262  -19.957  -28.175  18.976  23.272  19.212
$hboxset "select_high"
$hbox 0 "spine1" -11.380  -45.226  -23.710  55.635  45.226  42.377
$hbox 0 "root" -38.574  -43.187  -85.082  28.659  43.187  12.385
$hboxset "hands"
$hbox 0 "wrist_R" -42.818  -10.969  -11.898  -1.363  7.676  16.526
$hbox 0 "wrist_L" 1.363  -7.676  -16.526  42.818  10.969  11.898
$hboxset "head"
$hbox 0 "head" -13.267  -9.904  -16.589  15.112  9.904  16.649
$hboxset "select_low"
$hbox 0 "root" -67.379  -77.859  -84.876  59.254  77.859  86.140
$attachment "attach_attack1" "Index_1_L" 0.00 0.00 0.00 rotate 0.00 -0.00 0.00
$attachment "attach_head" "head" 0.00 0.00 0.00 rotate 0.00 0.00 -0.00
$attachment "eye_L" "head" 11.00 5.80 1.00 rotate 0.00 0.00 -0.00
$attachment "eye_R" "head" 11.00 -5.80 1.00 rotate 0.00 0.00 -0.00
$attachment "attach_attack2" "Index_1_R" 0.00 0.00 0.00 rotate -0.00 0.00 0.00
$attachment "attach_hitloc" "spine2" 0.00 0.00 0.00 rotate 0.00 -0.00 -0.00
$surfaceprop "default"
$keyvalues  {  } 
$illumposition -2.760 -0.000 100.618
$sequence BindPose "BindPose" fps 30.00
$sequence idle "idle" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence attack "attack" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 0 "SD_W follow_attachment attach_attack1" }
}

$sequence attack2 "attack2" ACT_DOTA_ATTACK2 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 0 "SD_W follow_attachment attach_attack2" }
}

$sequence ability1_cast "ability1_cast" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence ability2_cast "ability2_cast" ACT_DOTA_CAST_ABILITY_2 1 fps 30.00
$sequence ability3_cast "ability3_cast" ACT_DOTA_CAST_ABILITY_3 1 fps 30.00
$sequence ability4_cast "ability4_cast" ACT_DOTA_CAST_ABILITY_4 1 fps 30.00
$sequence ultimate "ultimate" ACT_DOTA_CAST_ABILITY_5 1 fps 30.00
$sequence stun "stun" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence flail "flail" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence death "death" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 97 "BodyImpact_Common.Medium" }
}

$sequence portrait "portrait" ACT_DOTA_CAPTURE 1 fps 30.00
$sequence portrait_hero_selector "portrait_hero_selector" ACT_DOTA_CAPTURE 2 fps 30.00
$sequence run "run" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 1 "Hero_ShadowDemon.Footsteps" }
  { event AE_CL_PLAYSOUND 14 "Hero_ShadowDemon.Footsteps" }
}

$sequence workshop_anim_00 "workshop_anim_00" fps 30.00
$sequence workshop_anim_01 "workshop_anim_01" fps 30.00
$sequence workshop_anim_02 "workshop_anim_02" fps 30.00
$sequence workshop_anim_03 "workshop_anim_03" fps 30.00
$sequence workshop_anim_04 "workshop_anim_04" fps 30.00
$sequence workshop_anim_05 "workshop_anim_05" fps 30.00
$sequence workshop_anim_06 "workshop_anim_06" fps 30.00
$sequence workshop_anim_07 "workshop_anim_07" fps 30.00
$sequence workshop_anim_08 "workshop_anim_08" fps 30.00
$sequence workshop_anim_09 "workshop_anim_09" fps 30.00
$sequence spawn "spawn" ACT_DOTA_SPAWN 1 fps 30.00
$sequence teleport "teleport" ACT_DOTA_TELEPORT 1 fps 30.00
$sequence teleport_end "teleport_end" ACT_DOTA_TELEPORT_END 1 fps 30.00
$sequence turns_lookFrame_0 "turns_lookFrame_0" fps 30.00
$sequence turns_lookFrame_1 "turns_lookFrame_1" fps 30.00
$sequence turns_lookFrame_2 "turns_lookFrame_2" fps 30.00
$sequence turns "turns_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 turns_lookFrame_0 turns_lookFrame_1 turns_lookFrame_2
}
