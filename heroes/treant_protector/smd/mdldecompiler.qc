$cd "H:\dota2resources\heros\treant_protector\smd"
$modelname "heroes/treant_protector/treant_protector.mdl"
$model "default" "treant_protector_model.dmx.smd"

$lod 1
 {
  replacemodel "treant_protector_model.dmx" "lod1_treant_protector_model.dmx"
}
$poseparameter turn -1.00 1.00
$cdmaterials ""
$hboxset "default"
$hbox 0 "elbow_R" -68.524  -16.870  -21.766  10.803  29.361  15.802
$hbox 0 "bicep_R" -34.212  -6.335  -17.183  4.684  37.101  48.060
$hbox 0 "elbow_L" -16.252  -29.360  -21.330  77.772  22.563  47.858
$hbox 0 "bicep_L" -6.859  -37.605  -21.429  41.871  7.891  14.036
$hbox 0 "spine3" -61.338  -54.746  -45.012  44.970  32.932  68.322
$hbox 0 "knee_L" -34.159  -25.863  -26.120  30.548  28.330  22.283
$hbox 0 "thigh_L" 2.995  -8.239  -10.562  42.272  12.489  13.528
$hbox 0 "knee_R" -44.070  -28.283  -22.580  34.159  25.863  26.070
$hbox 0 "thigh_R" -42.272  -12.489  -13.528  -2.995  8.239  10.562
$hbox 0 "root" -40.407  -49.059  -17.973  28.579  48.009  31.142
$hboxset "hands"
$hbox 0 "wrist_R" -64.969  -30.920  -18.226  12.377  27.182  31.861
$hbox 0 "wrist_L" -4.833  -15.792  -31.861  64.969  30.920  16.652
$hboxset "head"
$hbox 0 "head" -56.262  -36.227  -39.597  52.178  179.819  80.607
$hboxset "feet"
$hbox 0 "ankle_L" -23.719  -63.326  -50.305  30.688  45.807  64.680
$hbox 0 "ankle_R" -36.481  -51.920  -82.766  9.784  59.452  58.608
$hboxset "select_high"
$hbox 0 "root" -25.166  -60.487  -5.175  59.216  59.437  113.375
$hbox 0 "root" -13.757  -55.718  -102.793  71.194  58.237  18.541
$hboxset "select_low"
$hbox 0 "root" -50.506  -90.946  -97.447  106.162  89.896  110.617
$attachment "attach_mylittlebird" "R_leaf_R0C0" 0.00 -0.00 0.00 rotate -0.00 0.00 -0.00
$attachment "attach_attack1" "wrist_R" 0.00 0.00 0.00 rotate 0.00 -0.00 0.00
$attachment "attach_attack2" "wrist_L" 0.00 0.00 0.00 rotate 0.00 -0.00 -0.00
$attachment "attach_hitloc" "spine2" 0.00 0.00 0.00 rotate -0.00 -0.00 0.00
$attachment "ankle_L" "ankle_L" 0.00 0.00 0.00 rotate 0.00 -0.00 0.00
$attachment "ankle_R" "ankle_R" 0.00 0.00 0.00 rotate -0.00 -0.00 0.00
$surfaceprop "default"
$keyvalues  {  } 
$illumposition 2.605 4.649 119.123
$sequence BindPose "BindPose" fps 30.00
$sequence run "run" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 18 "TREANT_FOOT_STEP start_at_attachment ankle_L" }
  { event AE_CL_CREATE_PARTICLE_EFFECT 8 "TREANT_FOOT_STEP start_at_attachment ankle_R" }
  { event AE_CL_PLAYSOUND 1 "Hero_Treant.Footsteps" }
  { event AE_CL_PLAYSOUND 19 "Hero_Treant.Footsteps" }
}

$sequence run_injured "run_injured" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 18 "TREANT_FOOT_STEP start_at_attachment ankle_L" }
  { event AE_CL_CREATE_PARTICLE_EFFECT 8 "TREANT_FOOT_STEP start_at_attachment ankle_R" }
  { event AE_CL_PLAYSOUND 1 "Hero_Treant.Footsteps" }
  { event AE_CL_PLAYSOUND 19 "Hero_Treant.Footsteps" }
}

$sequence run_alt "run_alt" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 20 "TREANT_FOOT_STEP start_at_attachment ankle_L" }
  { event AE_CL_CREATE_PARTICLE_EFFECT 9 "TREANT_FOOT_STEP start_at_attachment ankle_R" }
  { event AE_CL_PLAYSOUND 2 "Hero_Treant.Footsteps" }
  { event AE_CL_PLAYSOUND 21 "Hero_Treant.Footsteps" }
}

$sequence idle "idle" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence idle_allt_shake "idle_allt_shake" ACT_DOTA_IDLE_RARE 3 fps 25.00
$sequence attack "attack" ACT_DOTA_ATTACK 1 fps 30.00
$sequence attack2 "attack2" ACT_DOTA_ATTACK2 1 fps 30.00
$sequence death "death" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 53 "TREANT_FOOT_STEP start_at_attachment ankle_L" }
  { event AE_CL_CREATE_PARTICLE_EFFECT 49 "TREANT_FOOT_STEP start_at_attachment ankle_R" }
  { event AE_CL_PLAYSOUND 5 "Hero_Treant.Death" }
  { event AE_CL_PLAYSOUND 54 "BodyImpact_Common.Heavy" }
}

$sequence flail "flail" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence stun "stun" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence abil1_natures_guise "abil1_natures_guise" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 1 "Hero_Treant.SpellFoley" }
  { event AE_CL_PLAYSOUND 10 "Hero_Treant.SpellFoley" }
}

$sequence abil2_leech_seed "abil2_leech_seed" ACT_DOTA_CAST_ABILITY_2 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 1 "Hero_Treant.SpellFoley" }
  { event AE_CL_PLAYSOUND 12 "Hero_Treant.SpellFoley" }
  { event AE_CL_PLAYSOUND 15 "Hero_Treant.SpellFoley" }
}

$sequence abil3_livingarmor "abil3_livingarmor" ACT_DOTA_CAST_ABILITY_3 1 fps 30.00
$sequence ulti "ulti" ACT_DOTA_CAST_ABILITY_4 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 3 "Hero_Treant.SpellFoley" }
  { event AE_CL_PLAYSOUND 10 "Hero_Treant.SpellFoley" }
  { event AE_CL_PLAYSOUND 19 "Hero_Treant.SpellFoley" }
  { event AE_CL_PLAYSOUND 23 "Hero_Treant.SpellFoley" }
  { event AE_CL_PLAYSOUND 0 "Hero_Treant.Overgrowth.CastAnim" }
}

$sequence capture "capture" loop ACT_DOTA_CAPTURE 1 fps 30.00
$sequence portrait_hero_selector "portrait_hero_selector" loop ACT_DOTA_CAPTURE 2 fps 30.00
$sequence spawn "spawn" ACT_DOTA_SPAWN 1 fps 30.00
$sequence turns_lookFrame_0 "turns_lookFrame_0" fps 30.00
$sequence turns_lookFrame_1 "turns_lookFrame_1" fps 30.00
$sequence turns_lookFrame_2 "turns_lookFrame_2" fps 30.00
$sequence turns_dupe1_lookFrame_0 "turns_dupe1_lookFrame_0" fps 30.00
$sequence turns_dupe1_lookFrame_1 "turns_dupe1_lookFrame_1" fps 30.00
$sequence turns_dupe1_lookFrame_2 "turns_dupe1_lookFrame_2" fps 30.00
$sequence turns_dupe2_lookFrame_0 "turns_dupe2_lookFrame_0" fps 30.00
$sequence turns_dupe2_lookFrame_1 "turns_dupe2_lookFrame_1" fps 30.00
$sequence turns_dupe2_lookFrame_2 "turns_dupe2_lookFrame_2" fps 30.00
$sequence turns "turns_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 turns_lookFrame_0 turns_lookFrame_1 turns_lookFrame_2
}
$sequence turns_dupe1 "turns_dupe1_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 turns_dupe1_lookFrame_0 turns_dupe1_lookFrame_1 turns_dupe1_lookFrame_2
}
$sequence turns_dupe2 "turns_dupe2_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 turns_dupe2_lookFrame_0 turns_dupe2_lookFrame_1 turns_dupe2_lookFrame_2
}
