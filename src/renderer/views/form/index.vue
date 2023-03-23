<template>
  <div class="app-container">
    <el-form ref="form" :model="formData" label-width="120px">
      <el-form-item label="活动名称">
        <el-input v-model="formData.name"></el-input>
      </el-form-item>
      <el-form-item label="活动地点">
        <el-select v-model="formData.region" placeholder="请选择活动地点">
          <el-option label="上海" value="上海"></el-option>
          <el-option label="北京" value="北京"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="即时交付">
        <el-switch v-model="formData.delivery"></el-switch>
      </el-form-item>
      <el-form-item label="额外选项">
        <el-checkbox-group v-model="formData.type">
          <el-checkbox label="在线活动" name="type"></el-checkbox>
          <el-checkbox label="促销活动" name="type"></el-checkbox>
          <el-checkbox label="线下活动" name="type"></el-checkbox>
          <el-checkbox label="发布会活动" name="type"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="资源选项">
        <el-radio-group v-model="formData.resource">
          <el-radio label="需要赞助商"></el-radio>
          <el-radio label="不需要赞助商"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="活动详情">
        <tinymce v-model="formData.desc" :height="300" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">Create</el-button>
        <el-button @click="onCancel">Cancel</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import Tinymce from "@/components/Tinymce";
import { ref } from "vue"
import { Message } from "element-ui"
const form = ref()
const formData = ref({
  name: "",
  region: "",
  date1: "",
  date2: "",
  delivery: false,
  type: [],
  resource: "",
  desc: ""
})
const onSubmit = () => {
  console.log(this.form)
  Message("submit!");
}
const onCancel = () => {
  Message({
    message: "cancel!",
    type: "warning"
  });
}
</script>

<style scoped>
.line {
  text-align: center;
}
</style>

