import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/services/offline_service.dart';
import '../models/lead_model.dart';

class PipelineRepository {
  final _api     = ApiClient.instance;
  final _offline = OfflineService.instance;

  Future<({List<LeadModel> leads, int total})> fetchLeads({
    String? stage,
    String? search,
    int limit = 20,
    int offset = 0,
  }) async {
    const cacheKey = 'pipeline_leads';

    if (!_offline.isOnline) {
      final cached = await _offline.readCache<Map<String, dynamic>>(cacheKey);
      if (cached != null) {
        final leads = (cached['leads'] as List? ?? [])
            .map((e) => LeadModel.fromJson(e as Map<String, dynamic>))
            .toList();
        final total = int.tryParse(cached['total']?.toString() ?? '0') ?? 0;
        return (leads: leads, total: total);
      }
      return (leads: <LeadModel>[], total: 0);
    }

    final res  = await _api.get(ApiConstants.pipeline, params: {
      if (stage  != null) 'stage':  stage,
      if (search != null && search.isNotEmpty) 'q': search,
      'limit':  limit,
      'offset': offset,
    });
    final data  = res.data as Map<String, dynamic>;
    final leads = (data['leads'] as List? ?? [])
        .map((e) => LeadModel.fromJson(e as Map<String, dynamic>))
        .toList();
    final total = int.tryParse(data['total']?.toString() ?? '0') ?? 0;

    // Cache hanya untuk halaman pertama tanpa filter
    if (stage == null && (search == null || search.isEmpty) && offset == 0) {
      await _offline.saveCache(cacheKey, data);
    }

    return (leads: leads, total: total);
  }

  Future<LeadModel> fetchDetail(String leadId) async {
    final cacheKey = 'lead_$leadId';

    if (!_offline.isOnline) {
      final cached = await _offline.readCache<Map<String, dynamic>>(cacheKey);
      if (cached != null) return LeadModel.fromJson(cached);
      throw Exception('Data tidak tersedia offline');
    }

    final res  = await _api.get('${ApiConstants.pipeline}/$leadId');
    final data = res.data as Map<String, dynamic>;
    final lead = data['lead'] as Map<String, dynamic>? ?? data;
    await _offline.saveCache(cacheKey, lead);
    return LeadModel.fromJson(lead);
  }

  Future<LeadModel> createLead(Map<String, dynamic> data) async {
    if (!_offline.isOnline) {
      await _offline.enqueue(method: 'POST', path: ApiConstants.pipeline, body: data);

      // Buat dummy lead dan inject ke cache agar langsung tampil di list
      final dummy = {
        'id': 'offline_${DateTime.now().millisecondsSinceEpoch}',
        'nama_company': data['nama_company'] ?? '',
        'contact_person': data['contact_person'] ?? '',
        'phone': data['phone'],
        'email': data['email'],
        'product': data['product'],
        'deal_value': data['deal_value'],
        'stage': data['stage'] ?? 'Prospect',
        'last_fu_notes': data['last_fu_notes'],
        'tgl_fu': data['tgl_fu'],
        'created_at': DateTime.now().toIso8601String(),
        '_offline': true,
      };

      // Update cache dengan prepend dummy ke leads array
      const cacheKey = 'pipeline_leads';
      final cached = await _offline.readCache<Map<String, dynamic>>(cacheKey);
      final existingLeads = List<dynamic>.from(cached?['leads'] as List? ?? []);
      existingLeads.insert(0, dummy);
      await _offline.saveCache(cacheKey, {
        ...?cached,
        'leads': existingLeads,
        'total': ((cached?['total'] as int?) ?? existingLeads.length - 1) + 1,
      });

      return LeadModel.fromJson(dummy);
    }
    final res = await _api.post(ApiConstants.pipeline, data: data);
    return LeadModel.fromJson(
      (res.data as Map<String, dynamic>)['lead'] as Map<String, dynamic>? ??
      res.data as Map<String, dynamic>,
    );
  }

  Future<void> updateLead(String leadId, Map<String, dynamic> data) async {
    if (!_offline.isOnline) {
      await _offline.enqueue(
        method: 'PUT',
        path: '${ApiConstants.pipeline}/$leadId',
        body: data,
        localRef: leadId,
      );
      return;
    }
    await _api.put('${ApiConstants.pipeline}/$leadId', data: data);
  }

  Future<void> deleteLead(String leadId) async {
    if (!_offline.isOnline) {
      await _offline.enqueue(
        method: 'DELETE',
        path: '${ApiConstants.pipeline}/$leadId',
        localRef: leadId,
      );
      return;
    }
    await _api.delete('${ApiConstants.pipeline}/$leadId');
  }

  Future<List<String>> fetchProducts() async {
    try {
      final res  = await _api.get('/v1/products');
      final data = res.data as Map<String, dynamic>;
      return List<String>.from(data['products'] as List? ?? []);
    } catch (_) {
      return [];
    }
  }
}
