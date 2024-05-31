<template>
  <el-container>

    <el-aside width="30%" style="background-color: white; border: 10px  solid #eee">
      <el-upload action :limit="1" :on-change="uploadChange" accpet=".json" :file-list="fileList">
        <el-button size="small" type="primary">点击上传JSON</el-button>
      </el-upload>
      <el-button type="primary" @click="downloadJSON">导出JSON</el-button>
      <el-table :data="originalJson" @row-click="eventRevise">
        <el-table-column prop="clipID" label="片段ID" width="80">
        </el-table-column>
        <el-table-column prop="event" label="事件动词" width="140">
        </el-table-column>
        <el-table-column prop="isRevised" label="是否已校对" width="120">
        </el-table-column>
      </el-table>
    </el-aside>
    <el-container>
      <el-header>
        <el-select v-model="event_value" placeholder="请选择事件">
          <el-option v-for="item in event_options" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-header>
      <el-main>
        <el-col :span="12">
          <el-table :data="revisingEvent">
            <el-table-column prop="argID" label="论元属性" width="140">
            </el-table-column>
            <el-table-column prop="value" label="值" width="280">
            </el-table-column>

          </el-table>
        </el-col>
        <el-col :span="12">
          test
        </el-col>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      event_options: [{
        value: '选项1',
        label: '黄金糕'
      }],
      event_value: '',
      fileList: [],
      originalJson: [],
      revisingEvent: []
    }
  },
  methods: {
    uploadChange(file, fileList) {
      this.fileList = fileList;
      var reader = new FileReader();
      reader.readAsText(file.raw);
      reader.onload = (e) => {
        this.originalJson = JSON.parse(e.target.result)['clip'];
        this.originalJson.forEach(i => {
          i['isRevised'] = '否';
        });
      }
    },
    async eventRevise(row) {
      [
        'arg0_ins',
        'arg1_ins',
        'arg2_ins',
        'arg3_ins',
        'arg4_ins',
        'argM-LOC',
        'argM-EXT',
      ].forEach(argID => {
        const value = argID.includes('ins') ? row['instance'][argID] : row[argID]; // 检查是否属于 instance
        if (value != null && value != undefined) {
          this.revisingEvent.push({ 'argID': argID, 'value': value });
        }
      });
      console.log(this.revisingEvent);
    },
    downloadJSON() { }
  }
}
</script>

<style></style>