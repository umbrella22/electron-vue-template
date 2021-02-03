<template>
  <div class="app-container">
    <el-form ref="form" :model="form" label-width="120px">
      <el-form-item label="活动名称">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="活动地点">
        <el-select v-model="form.region" placeholder="请选择活动地点">
          <el-option label="上海" value="上海"></el-option>
          <el-option label="北京" value="北京"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="活动时间">
        <el-col :span="11">
          <el-date-picker type="date" placeholder="选择时间" v-model="form.date1" style="width: 100%;"></el-date-picker>
        </el-col>
        <el-col class="line" :span="2">-</el-col>
        <el-col :span="11">
          <el-time-picker
            type="fixed-time"
            placeholder="选择时间"
            v-model="form.date2"
            style="width: 100%;"
          ></el-time-picker>
        </el-col>
      </el-form-item>
      <el-form-item label="即时交付">
        <el-switch v-model="form.delivery"></el-switch>
      </el-form-item>
      <el-form-item label="额外选项">
        <el-checkbox-group v-model="form.type">
          <el-checkbox label="在线活动" name="type"></el-checkbox>
          <el-checkbox label="促销活动" name="type"></el-checkbox>
          <el-checkbox label="线下活动" name="type"></el-checkbox>
          <el-checkbox label="发布会活动" name="type"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="资源选项">
        <el-radio-group v-model="form.resource">
          <el-radio label="需要赞助商"></el-radio>
          <el-radio label="不需要赞助商"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="活动详情">
        <tinymce v-model="form.desc" :height="300" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">Create</el-button>
        <el-button @click="onCancel">Cancel</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import Tinymce from "@/components/Tinymce";
export default {
  components: { Tinymce },
  data() {
    return {
      form: {
        name: "",
        region: "",
        date1: "",
        date2: "",
        delivery: false,
        type: [],
        resource: "",
        desc: ""
      }
    };
  },
  methods: {
    onSubmit() {
      console.log(this.form)
      this.$message("submit!");
    },
    onCancel() {
      this.$message({
        message: "cancel!",
        type: "warning"
      });
    }
  }
};
</script>

<style scoped>
.line {
  text-align: center;
}
</style>

