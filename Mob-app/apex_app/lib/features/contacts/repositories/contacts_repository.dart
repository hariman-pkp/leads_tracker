import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/contact_model.dart';

class ContactsRepository {
  final _api = ApiClient.instance;

  Future<({List<ContactModel> contacts, int total})> fetchContacts({
    String? search,
    int limit = 20,
    int offset = 0,
  }) async {
    final res  = await _api.get(ApiConstants.contacts, params: {
      if (search != null && search.isNotEmpty) 'q': search,
      'limit':  limit,
      'offset': offset,
    });
    final data     = res.data as Map<String, dynamic>;
    final contacts = (data['contacts'] as List? ?? [])
        .map((e) => ContactModel.fromJson(e as Map<String, dynamic>))
        .toList();
    final total = int.tryParse(data['total']?.toString() ?? '0') ?? contacts.length;
    return (contacts: contacts, total: total);
  }

  Future<ContactModel> createContact(Map<String, dynamic> data) async {
    final res = await _api.post(ApiConstants.contacts, data: data);
    final body = res.data as Map<String, dynamic>;
    return ContactModel.fromJson(body['contact'] as Map<String, dynamic>? ?? body);
  }

  Future<void> updateContact(int id, Map<String, dynamic> data) async {
    await _api.put('${ApiConstants.contacts}/$id', data: data);
  }

  Future<void> deleteContact(int id) async {
    await _api.delete('${ApiConstants.contacts}/$id');
  }

  Future<String> uploadFoto(int id, XFile xfile) async {
    final bytes = await xfile.readAsBytes();
    final fd = FormData.fromMap({
      'foto': MultipartFile.fromBytes(bytes, filename: xfile.name),
    });
    final res = await _api.dio.post(
      '${ApiConstants.fastApiUrl}${ApiConstants.contacts}/$id/foto',
      data: fd,
      options: Options(
        contentType: 'multipart/form-data',
        // override baseUrl — pakai absolute URL ke FastAPI port 8001
      ),
    );
    final body = res.data as Map<String, dynamic>;
    return body['foto'] as String;
  }
}
